// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";
import "./Parameters.sol";
import "./Storage.sol";

contract Energy {
    Parameters internal _parameters;
    Tools internal _tools;
    Storage internal _storage;
    Token internal _ENT;

    struct WH {
        uint256 available;
        uint256 locked;
    }
    struct ConsumptionSession {
        //Parameters of a consumsion session
        bool state;
        uint256 wh; //Available wh to consume
        uint256 cost; //Burn cost
        uint256 timestamp;
        address consumer;
        address unit;
    }
    struct UserConsumptionSession {
        string sessionId;
        uint256 wh;
        uint256 timestamp;
        address unit;
    }
    mapping(address => bool) private _owners;
    string[] internal _consumptionSessions;
    mapping(address => string[]) internal _userConsumptionSessions;
    mapping(address => mapping(string => bool))
        internal _userConsumptionSessionExists;
    mapping(string => ConsumptionSession) internal _activeSessions;
    uint256 _mintingCost = 0;
    uint256 _burningCost = 0;

    constructor(Parameters params, Tools tools, Token ent) {
        _tools = tools;
        _ENT = ent;
        _parameters = params;
        _owners[msg.sender] = true;
        _storage = new Storage(this);
        _mintingCost = 0;
        _burningCost = 0;
    }

    // Handle storage units >>>>>>>
    function registerUnit(address addr, address owner) public {
        require(_owners[msg.sender], "Not authorized to register new unit");
        _storage.registerUnit(addr,owner);
    }

    function disableStorageUnit(address addr) public {
        require(_owners[msg.sender], "Not authorized to diable storage units");
        _storage.disableStorageUnit(addr);
        clearOldSessions(); //Remove sessions that are not valid anymore
    }

    function getStorageUnits() public view returns (address[] memory) {
        return _storage.storageUnitAddresses();
    }

    function getStorageUnitsInfo() public view  returns (Storage.StorageUnitInfo[] memory) {
        return _storage.getStorageUnitsInfo();
    }

    function getStorageUnitState(address addr) public view returns (bool) {
        return _storage.state(addr);
    }

    function getAvailableEnergy(address unit) public view returns (uint256) {
        return _storage.availableEnergy(unit);
    }

    function getTotalEnergy() public view returns (uint256) {
        //Total energy in wh
        return _storage.totalNetworkEnergy();
    }

    // Handle energy production/consumption >>>>>>>
    function getBurningCost() public view returns (uint256) {
        return _burningCost;
    }
    function getMintingCost() public view returns (uint256) {
        return _mintingCost;
    }
    function getEnergyTokenDifference() private view returns(uint256){
        return _tools.distance( (_storage.totalNetworkEnergy() * _tools.multiplier()) / 1000, _ENT.total() );
    }
    function setCost() public{
        //Set ENT cost for minting / burning tokens
        uint256 cost = getEnergyTokenDifference() * _parameters.C() / _tools.multiplier();

        _mintingCost = cost;
        _burningCost = cost;
        if (_mintingCost > _parameters.M()) {
            _mintingCost = _parameters.M();
        }
        if (_burningCost > _parameters.M()) {
            _burningCost = _parameters.M();
        }
    }
    function getConsumptionSessionID( address unit, address consumer ) internal view returns (string memory) {
        return _tools.concat(unit, consumer);
    }

    function startConsumption(address unit, address consumer, uint256 entAmmount) public returns (string memory) {
        require(_owners[msg.sender], "Not authorized to start a consumption session");
        require(_ENT.balance(consumer) >= entAmmount, "Not enough ENT tokens");
        require(_storage.state(unit), "Storage Unit is disabled");
        require(_storage.totalNetworkEnergy() > 0, "No energy available");

        //Create consumption session id
        string memory consumptionSessionID = getConsumptionSessionID(unit, consumer);
        require( !_activeSessions[consumptionSessionID].state, "Another consumption session is already active with the provided storage unit");

        //Check Wh to be consumed
        uint256 cost = getBurningCost();
        uint256 burnRate = _tools.multiplier() + cost; //ENT burned per 1 kWh
        //uint256 whPerEnt = _tools.multiplier() * 1000 / burnRate; //wh per 1 ENT burned
        uint256 wh = entAmmount * 1000 / burnRate ;
        //uint256 wh = 0;
        //if (whPerEnt < 1000){ //There is a cost
        //    uint256 entUntilEquilibrium = getEnergyTokenDifference() / (1000 - whPerEnt);
        //    uint256 ent = entAmmount;
        //    if (entUntilEquilibrium < ent){ //Apply cost until equilibrium
        //        ent -= entUntilEquilibrium;
        //        wh = whPerEnt * entUntilEquilibrium / _tools.multiplier();
        //        whPerEnt = 1000;
        //    }
        //    wh += whPerEnt * ent / _tools.multiplier();
        //}else{ //No cost
        //    wh = 1000 * entAmmount / _tools.multiplier();
        //}

        require( _storage.availableEnergy(unit) >= wh, "No energy available in storage unit" );
        _storage.lockEnergy(unit,wh); //Remove kwh to be consumsed from available kwh (not consumed yet just locked for consumtions)
        
        //Start consumption session and lock ent ammount
        _activeSessions[consumptionSessionID] = ConsumptionSession(
            true,
            wh,
            cost,
            block.timestamp,
            consumer,
            unit
        );
        _consumptionSessions.push(consumptionSessionID);
        _ENT.lockAmmount(consumer, unit, entAmmount);
        if (!_userConsumptionSessionExists[consumer][consumptionSessionID]) {
            _userConsumptionSessions[consumer].push(consumptionSessionID);
            _userConsumptionSessionExists[consumer][
                consumptionSessionID
            ] = true;
        }
        return consumptionSessionID; //Return back the consumption session id
    }

    function getConsumptionSessionEnergy(address unit, address consumer) public view returns (uint256) {
        require(_owners[msg.sender], "You are not authorized to execute this method" );
        address unit_addr = unit;
        address consumer_addr = consumer;
        if (!_storage.state(unit_addr)) {
            //Check if input was given the other way arround
            unit_addr = consumer;
            consumer_addr = unit;
        }
        require(_storage.state(unit_addr), "Storage unit not active");
        string memory consumptionSessionID = getConsumptionSessionID(
            unit_addr,
            consumer_addr
        );
        return _activeSessions[consumptionSessionID].wh;
    }

    function getConsumptionSessions(address addr) public view returns (UserConsumptionSession[] memory sessions) {
        require( _owners[msg.sender], "You are not authorized to execute this method" );
        uint length = _userConsumptionSessions[addr].length;
        UserConsumptionSession[] memory userSessions = new UserConsumptionSession[](length);
        uint j = 0;
        for (uint i; i < length; i++) {
            string memory sessionId = _userConsumptionSessions[addr][i];
            if (!_activeSessions[sessionId].state) {
                if (userSessions.length > 0) 
                    assembly { mstore(userSessions, sub(mload(userSessions), 1)) }
                continue; //Keep only active sessions
            }
            userSessions[j] = (
                UserConsumptionSession(
                    sessionId,
                    _activeSessions[sessionId].wh,
                    _activeSessions[sessionId].timestamp,
                    _activeSessions[sessionId].unit
                )
            );
            j += 1;
        }
        return userSessions;
        //UserConsumptionSession
    }

    function consume(address unit,address consumer,uint256 wh ) public returns (uint256) {
        require( _owners[msg.sender], "You are not authorized to execute this method" );
        require( getStorageUnitState(unit), "Method can be called only by active storage units");
        require( consumer != unit, "Storage units not allowed to consume energy themselfs" );

        string memory sessionID = getConsumptionSessionID(unit, consumer);
        clearSession(sessionID); //Clear session if it's not valid
        require(  _activeSessions[sessionID].state, "No active consumption session with provided consumer");
        bool equilibriumReached = false;
        uint256 cost = _activeSessions[sessionID].cost;
        uint256 burnRate = _tools.multiplier() + cost; //ENT burned per 1 kWh
        uint256 whOffset = 0;
        if (_activeSessions[sessionID].wh < wh) {
            //!\\ Warning //!\\
            whOffset = wh - _activeSessions[sessionID].wh;
            wh = _activeSessions[sessionID].wh;
            //Over-Consumption
        }
        uint256 whConsumed = wh;
        uint256 amnt = 0; //Amount to be burned
        if (cost > 0){
            uint256 whUntilEquilibrium = getEnergyTokenDifference() / cost * 1000;
            if (whUntilEquilibrium < whConsumed){ 
                //Apply cost until equilibrium
                whConsumed -= whUntilEquilibrium;
                amnt = whUntilEquilibrium * burnRate / 1000;
                burnRate = _tools.multiplier();
                equilibriumReached = true;
                _activeSessions[sessionID].cost = 0;
            }
        }
        amnt += whConsumed * burnRate / 1000;
        _ENT.unlockAmmount(consumer, unit, amnt);
        _ENT.burn(consumer, amnt);
        _activeSessions[sessionID].wh -= wh;
        _storage.consumeLockedEnergy(unit,wh);
        if (whOffset > 0) {
            //If more energy was consumed, align storage unit energy
            uint256 unitEnergy = _storage.totalEnergy(unit);
            if (unitEnergy <= whOffset )
                whOffset = unitEnergy;
            balanceStorageUnitEnergy(unit, unitEnergy - whOffset);
        }
        if (_activeSessions[sessionID].wh == 0) clearSession(sessionID);
        if (equilibriumReached) setCost();
        return amnt;
    }

    function produce( address unit, address producer, uint256 wh ) public returns (uint256) {
        require( _owners[msg.sender], "You are not authorized to execute this method");
        require( getStorageUnitState(unit), "Method can be called only by active storage units");
        require( producer != unit, "Storage units not allowed to produce energy themselfs");
        uint256 cost = getMintingCost(); // Mint cost
        uint256 mintRate = _tools.multiplier() - cost; //ENT minted per 1 kWh
        bool equilibriumReached = false;
        uint amnt = 0;
        uint256 whProduced = wh; //10000
        if (cost > 0){
            uint256 whUntilEquilibrium = getEnergyTokenDifference() / cost * 1000;
            if (whUntilEquilibrium <= whProduced){
                whProduced -= whUntilEquilibrium;
                amnt += whUntilEquilibrium * mintRate / 1000;
                mintRate = _tools.multiplier();
                equilibriumReached = true;
            }
        }
        amnt += whProduced * mintRate / 1000;

        _storage.produceEnergy(unit,wh);
        _ENT.mint( _storage.owner(unit), (amnt * _parameters.F() / _tools.multiplier()) ); //Storage provider cut
        _ENT.mint( producer, (amnt * (_tools.multiplier() - _parameters.F()) / _tools.multiplier()) ); //Energy producer payment
        if (equilibriumReached) setCost();
        return amnt;
    }

    function balanceStorageUnitEnergy(address unit, uint256 actualEnergy) public {
        require( _owners[msg.sender], "You are not authorized to execute this method");
        require( getStorageUnitState(unit),"Method can be called only by active storage units");
        _storage.balanceStorageUnitEnergy(unit, actualEnergy);
        setCost();
    }

    function clearOldSessions() public {
        uint length = _consumptionSessions.length;
        for (uint256 i = 0; i < length; i++) {
            clearSession(_consumptionSessions[i]);
            if (_activeSessions[_consumptionSessions[i]].state == false){
                _consumptionSessions[i] = _consumptionSessions[_consumptionSessions.length - 1];
                _consumptionSessions.pop();
                if (i>0) i--;
                length--;
            }
        }
    }
    function clearSession(string memory sessionID) private {
        ConsumptionSession memory session = _activeSessions[sessionID];
        if ( block.timestamp < session.timestamp + _parameters.H() && 
             session.wh > 0 && 
             session.state == true &&
             _storage.state(session.unit) ){
            return; //Session still relevant, don't clear...
        }
        //Return locked ENT to consumer and locked Wh to storage unit :
        _ENT.unlockAmmount( session.consumer, session.unit ); //Unlock locked ENT
        _storage.unlockEnergy(session.unit,session.wh);
        //Remove session :
        _activeSessions[sessionID] = ConsumptionSession(
                false,
                0,
                0,
                0,
                address(0),
                address(0)
            );
    }
}