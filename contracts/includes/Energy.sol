// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";
import "./Parameters.sol";

contract Energy{
    Token internal _ENT;
    Parameters internal _parameters;
    Tools internal _tools;

    struct KWH {
        uint256 available;
        uint256 locked;
    }
    struct StorageUnitInfo {
        //Information about a storage unit
        bool state;
        address owner;
        uint256 kwh;
    }
    struct ConsumptionSession {
        //Parameters of a consumsion session
        bool state;
        uint256 kwh; //Available kwh to consume
        uint256 rate; //Burn rate
        uint256 timestamp;
        address consumer;
        address unit;
    }
    struct UserConsumptionSession {
        string sessionId;
        uint256 kwh;
        uint256 timestamp;
        address unit;
    }

    address private _owner;
    uint256 private _totalKwh;
    uint256 internal _storageUnitsNumber;
    address[] internal _storageUnitAddresses;
    string[] internal _consumptionSessions;
    mapping(address => string[]) internal _userConsumptionSessions;
    mapping(address => mapping(string => bool)) internal _userConsumptionSessionExists;
    mapping(address => StorageUnitInfo) internal _storageUnits;
    mapping(string => ConsumptionSession) internal _activeSessions;
    
    constructor(Parameters params) {
        _tools = new Tools();
        _parameters = params;
        _owner = msg.sender;
        _ENT = new Token("ENT");
        _totalKwh = 0;
        _storageUnitsNumber = 0;
    }

    // Handle storage units >>>>>>>
    function registerUnit(address addr, address owner) public{
        require(msg.sender == _owner,"Not authorized to register new unit");
        _storageUnitsNumber += 1;
        _storageUnits[addr] = StorageUnitInfo(true,owner,0);
        _storageUnitAddresses.push(addr);
    }
    function disableStorageUnit(address addr) public{
        require(msg.sender == _owner,"Not authorized to diable storage units");
        _storageUnits[addr].state = false;
    }
    function getStorageUnits() public view returns(address[] memory) {
        return _storageUnitAddresses;
    }
    function getStorageUnitsInfo() public view returns(StorageUnitInfo[] memory){
        StorageUnitInfo[] memory unitsInfo = new StorageUnitInfo[](_storageUnitAddresses.length);
        StorageUnitInfo memory unit;
        for(uint i = 0; i < _storageUnitAddresses.length; i++){
            unit = _storageUnits[_storageUnitAddresses[i]];
            if (!unit.state) continue;
            unitsInfo[i] = unit;
            unitsInfo[i].owner = _storageUnitAddresses[i]; //Instead of owner, return the unit address
        }
        return unitsInfo;
    }
    function getStorageUnitState(address addr) public view returns(bool){
        return _storageUnits[addr].state;
    }
    function getAvailableKwh(address unit) public view returns(uint256){
        return _storageUnits[unit].kwh;
    }
    function getTotalKwh() public view returns(uint256){
        return _totalKwh;
    }

    // Handle energy production/consumption >>>>>>>
    function getBurnRate() public view returns(uint256){//ENT To be burned per kWh consumed
        uint256 loss = _tools.distance(_totalKwh, _ENT.total()) * _parameters.C();
        uint256 rate = _tools.multiplier() + loss;
        if (rate > _parameters.B()) return _parameters.B();
        else return rate;
    }
    function getMintRate() public view returns(uint256){ //ENT To be minter per kWh produced
        uint256 loss = _tools.distance(_totalKwh, _ENT.total()) * _parameters.C();
        if ( _tools.multiplier() > loss){
            if (_tools.multiplier()-loss < _parameters.M()) return _parameters.M();
            else return _tools.multiplier()-loss;
        }
        else{
            return _parameters.M();
        }
    }
    function getConsumptionSessionID(address unit, address consumer) internal view returns(string memory){
        return _tools.concat(unit,consumer);
    }
    function startConsumption(address unit,address consumer,uint256 entAmmount) public returns(string memory){
        require(msg.sender == _owner,"Not authorized to start a consumption session");
        require(_ENT.balance(consumer) >= entAmmount,"Not enough ENT tokens");
        require(_storageUnits[unit].state,"Storage Unit is disabled");
        require(_totalKwh > 0, "No energy available");

        //Create consumption session id
        string memory consumptionSessionID = getConsumptionSessionID(unit,consumer);
        require(!_activeSessions[consumptionSessionID].state,"Another consumption session is already active with the provided storage unit");

        //Check kWh to be consumed
        uint256 rate = getBurnRate();
        uint256 kwh = entAmmount / rate * _tools.multiplier(); //Get amount of kwh to be consumed
        require(_storageUnits[unit].kwh >= kwh,"No energy available in storage unit");
        _storageUnits[unit].kwh -= kwh; //Remove kwh to be consumsed from available kwh (not consumed yet just locked for consumtions)
        
        //Start consumption session and lock ent ammount
        _activeSessions[consumptionSessionID] = ConsumptionSession(true,kwh,rate,block.timestamp,consumer,unit);
        _consumptionSessions.push(consumptionSessionID);
        _ENT.lockAmmount(consumer,unit,entAmmount);
        if (!_userConsumptionSessionExists[consumer][consumptionSessionID]){
            _userConsumptionSessions[consumer].push(consumptionSessionID);
            _userConsumptionSessionExists[consumer][consumptionSessionID] = true;
        }
        return consumptionSessionID; //Return back the consumption session id
    }
    function getConsumptionSessionEnergy(address unit, address consumer) public view returns(uint256){
        require(msg.sender == _owner,"You are not authorized to execute this method");
        require(_storageUnits[unit].state, "Storage unit not active");
        string memory consumptionSessionID = getConsumptionSessionID(unit, consumer);
        return _activeSessions[consumptionSessionID].kwh;
    }
    function getUserConsumptionSessions(address addr) public view returns(UserConsumptionSession[] memory sessions){
        uint length = 1;
        UserConsumptionSession[] memory userSessions = new UserConsumptionSession[](length);
        for(uint i; i < _userConsumptionSessions[addr].length; i++){
            string memory sessionId = _userConsumptionSessions[addr][i];
            if (!_activeSessions[sessionId].state) continue; //Keep only active sessions
            userSessions[i] = (
                UserConsumptionSession(
                    sessionId,
                    _activeSessions[sessionId].kwh,
                    _activeSessions[sessionId].timestamp,
                    _activeSessions[sessionId].unit));
            assembly {
                // Increase array length by one
                mstore(userSessions, add(length, 1))
            }
            length = userSessions.length;
        }
        return userSessions;
        //UserConsumptionSession
    }
    function consume(address unit,address consumer,uint256 kwh) public returns(uint256){
        require(msg.sender == _owner,"You are not authorized to execute this method");
        require(_storageUnits[unit].state,"Storage unit not active");
        string memory sessionID = getConsumptionSessionID(unit,consumer);
        require(_activeSessions[sessionID].state,"No active consumption session with provided consumer");
        uint256 rate = _activeSessions[sessionID].rate;
        if (_activeSessions[sessionID].kwh < kwh) kwh = _activeSessions[sessionID].kwh; //Over-Consumption
        uint256 amnt = kwh * rate; //Get amount of ent to be consumed
        if (_ENT.balanceLockedFromContractor(consumer,unit) < amnt) amnt = _ENT.balanceLockedFromContractor(consumer,consumer); //Over-Consumption
        _ENT.unlockAmmount(consumer,unit,amnt);
        _ENT.burn(consumer, amnt);
        _activeSessions[sessionID].kwh -= kwh;
        _totalKwh -= kwh;
        return amnt;
    }
    function produce(address unit,address producer, uint256 kwh) public returns(uint256){
        require(msg.sender == _owner,"You are not authorized to execute this method");
        require(_storageUnits[unit].state,"Storage unit not active");
        _storageUnits[unit].kwh += kwh;
        _totalKwh += kwh;
        uint256 amnt = kwh * getMintRate();
        _ENT.mint(_storageUnits[unit].owner, amnt * _parameters.F() / _tools.multiplier()); //Storage provider cut
        _ENT.mint(producer, amnt * (1-_parameters.F()) / _tools.multiplier()); //Energy producer payment
        return amnt;
    }
    function clearOldSessions() public{
        uint length = _consumptionSessions.length;
        for (uint256 i = 0; i < length; i++) {
            ConsumptionSession memory session = _activeSessions[_consumptionSessions[i]];
            if (block.timestamp >= session.timestamp + _parameters.H()) {
                //Return locked ENT to consumer and lockeg kWh to storage unit :
                _ENT.unlockAmmount(session.consumer,session.unit,0); //Unlock locked ENT
                _storageUnits[session.unit].kwh += session.kwh; //Unlock locked Unit kWh
                _totalKwh += session.kwh;
                //Remove session :
                _activeSessions[_consumptionSessions[i]] = ConsumptionSession(false,0,0,0,address(0),address(0));
                _consumptionSessions[i] = _consumptionSessions[length - 1];
                _consumptionSessions.pop();
            }
        }
    }

    // Handle energy tokens >>>>>>>
    function energyTokenBalance(address addr) public view returns(uint256 available,uint256 locked){
        return (_ENT.balance(addr),_ENT.lockedBalance(addr));
    }
    function transferEnergyTokens(address from, address to, uint256 amnt) public {
        require(msg.sender == _owner,"You are not authorized to execute this method");
        _ENT.transfer(from, to, amnt);
    }
    function getENTAddress() public view returns(address token){
        return address(_ENT);
    }
}