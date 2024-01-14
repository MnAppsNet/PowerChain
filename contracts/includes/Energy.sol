// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";
import "./Parameters.sol";

contract Energy {
    Token internal _ENT;
    Parameters internal _parameters;
    Tools internal _tools;

    struct WH {
        uint256 available;
        uint256 locked;
    }
    struct StorageUnitInfo {
        //Information about a storage unit
        bool state;
        address owner;
        uint256 wh;
    }
    struct ConsumptionSession {
        //Parameters of a consumsion session
        bool state;
        uint256 wh; //Available wh to consume
        uint256 rate; //Burn rate
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

    address private _owner;
    uint256 private _totalWh;
    uint256 internal _storageUnitsNumber;
    address[] internal _storageUnitAddresses;
    mapping(address => bool) internal _storageUnitAlreadyInList;
    string[] internal _consumptionSessions;
    mapping(address => string[]) internal _userConsumptionSessions;
    mapping(address => mapping(string => bool))
        internal _userConsumptionSessionExists;
    mapping(address => StorageUnitInfo) internal _storageUnits;
    mapping(string => ConsumptionSession) internal _activeSessions;

    constructor(Parameters params, Tools tools) {
        _tools = tools;
        _parameters = params;
        _owner = msg.sender;
        _ENT = new Token("ENT");
        _totalWh = 0;
        _storageUnitsNumber = 0;
    }

    // Handle storage units >>>>>>>
    function registerUnit(address addr, address owner) public {
        require(msg.sender == _owner, "Not authorized to register new unit");
        _storageUnitsNumber += 1;
        _storageUnits[addr] = StorageUnitInfo(true, owner, 0);
        if (!_storageUnitAlreadyInList[addr]) {
            _storageUnitAddresses.push(addr);
            _storageUnitAlreadyInList[addr] = true;
        }
    }

    function disableStorageUnit(address addr) public {
        require(msg.sender == _owner, "Not authorized to diable storage units");
        _storageUnits[addr].state = false;
    }

    function getStorageUnits() public view returns (address[] memory) {
        return _storageUnitAddresses;
    }

    function getStorageUnitsInfo()
        public
        view
        returns (StorageUnitInfo[] memory)
    {
        StorageUnitInfo[] memory unitsInfo = new StorageUnitInfo[](
            _storageUnitAddresses.length
        );
        StorageUnitInfo memory unit;
        for (uint i = 0; i < _storageUnitAddresses.length; i++) {
            unit = _storageUnits[_storageUnitAddresses[i]];
            if (!unit.state) continue;
            unitsInfo[i] = unit;
            unitsInfo[i].owner = _storageUnitAddresses[i]; //Instead of owner, return the unit address
        }
        return unitsInfo;
    }

    function getStorageUnitState(address addr) public view returns (bool) {
        return _storageUnits[addr].state;
    }

    function getAvailableEnergy(address unit) public view returns (uint256) {
        return _storageUnits[unit].wh;
    }

    function getTotalEnergy() public view returns (uint256) {
        //Total energy in wh
        return _totalWh;
    }

    // Handle energy production/consumption >>>>>>>
    function getBurnRate() public view returns (uint256) {
        //ENT To be burned per kWh consumed
        if (_totalWh == 0) return 1 * _tools.multiplier();
        uint256 loss = (_tools.distance(
            (_totalWh * _tools.multiplier()) / 1000,
            _ENT.total()
        ) * _parameters.C()) / _tools.multiplier();
        if (_tools.multiplier() + loss < _parameters.B())
            return _tools.multiplier() + loss;
        else return _parameters.B();
    }

    function getMintRate() public view returns (uint256) {
        //ENT To be minter per kWh produced
        if (_totalWh == 0) return 1 * _tools.multiplier();
        uint256 loss = (_tools.distance(
            (_totalWh * _tools.multiplier()) / 1000,
            _ENT.total()
        ) * _parameters.C()) / _tools.multiplier();
        if (_tools.multiplier() > loss) {
            uint256 tempMintRate = _tools.multiplier() - loss;
            if (tempMintRate > _parameters.M()) return tempMintRate;
            else return _parameters.M();
        } else return _parameters.M();
    }

    function getConsumptionSessionID(
        address unit,
        address consumer
    ) internal view returns (string memory) {
        return _tools.concat(unit, consumer);
    }

    function startConsumption(
        address unit,
        address consumer,
        uint256 entAmmount
    ) public returns (string memory) {
        require(
            msg.sender == _owner,
            "Not authorized to start a consumption session"
        );
        require(_ENT.balance(consumer) >= entAmmount, "Not enough ENT tokens");
        require(_storageUnits[unit].state, "Storage Unit is disabled");
        require(_totalWh > 0, "No energy available");

        //Create consumption session id
        string memory consumptionSessionID = getConsumptionSessionID(
            unit,
            consumer
        );
        require(
            !_activeSessions[consumptionSessionID].state,
            "Another consumption session is already active with the provided storage unit"
        );

        //Check Wh to be consumed
        uint256 rate = getBurnRate();
        uint256 wh = (entAmmount / rate) * 1000; //Get amount of wh to be consumed
        require(
            _storageUnits[unit].wh >= wh,
            "No energy available in storage unit"
        );
        _storageUnits[unit].wh -= wh; //Remove kwh to be consumsed from available kwh (not consumed yet just locked for consumtions)

        //Start consumption session and lock ent ammount
        _activeSessions[consumptionSessionID] = ConsumptionSession(
            true,
            wh,
            rate,
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

    function getConsumptionSessionEnergy(
        address unit,
        address consumer
    ) public view returns (uint256) {
        require(
            msg.sender == _owner,
            "You are not authorized to execute this method"
        );
        require(_storageUnits[unit].state, "Storage unit not active");
        string memory consumptionSessionID = getConsumptionSessionID(
            unit,
            consumer
        );
        return _activeSessions[consumptionSessionID].wh;
    }

    function getUserConsumptionSessions(
        address addr
    ) public view returns (UserConsumptionSession[] memory sessions) {
        uint length = _userConsumptionSessions[addr].length;
        UserConsumptionSession[]
            memory userSessions = new UserConsumptionSession[](length);
        uint j = 0;
        for (uint i; i < length; i++) {
            string memory sessionId = _userConsumptionSessions[addr][i];
            if (!_activeSessions[sessionId].state) {
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

    function consume(
        address unit,
        address consumer,
        uint256 wh ) public returns (uint256) {
        require( msg.sender == _owner, "You are not authorized to execute this method" );
        require(_storageUnits[unit].state, "Storage unit not active");
        string memory sessionID = getConsumptionSessionID(unit, consumer);
        clearOldSession(sessionID); //Clear session if it's old
        require(  _activeSessions[sessionID].state, "No active consumption session with provided consumer");
        uint256 rate = _activeSessions[sessionID].rate;
        if (_activeSessions[sessionID].wh < wh) {
            //!\\ Warning //!\\
            wh = _activeSessions[sessionID].wh;
            //Over-Consumption
        }
        uint256 amnt = (wh * rate) / 1000; //Get amount of ent to be consumed
        if (_ENT.balanceLockedFromContractor(consumer, unit) < amnt) {
            //!\\ Warning //!\\
            amnt = _ENT.balanceLockedFromContractor(consumer, consumer);
            //Over-Consumption
        }
        _ENT.unlockAmmount(consumer, unit, amnt);
        _ENT.burn(consumer, amnt);
        _activeSessions[sessionID].wh -= wh;
        _totalWh -= wh;
        clearOldSessions();
        return amnt;
    }

    function produce( address unit, address producer, uint256 wh ) public returns (uint256) {
        require( msg.sender == _owner, "You are not authorized to execute this method");
        require(_storageUnits[unit].state, "Storage unit not active");
        uint256 amnt = (wh * getMintRate()) / 1000;
        _storageUnits[unit].wh += wh;
        _totalWh += wh;
        _ENT.mint( _storageUnits[unit].owner, (amnt * _parameters.F()) / _tools.multiplier() ); //Storage provider cut
        _ENT.mint( producer, (amnt * (_tools.multiplier() - _parameters.F())) / _tools.multiplier() ); //Energy producer payment
        return amnt;
    }

    function clearOldSessions() public {
        uint length = _consumptionSessions.length;
        for (uint256 i = 0; i < length; i++) {
            clearOldSession(_consumptionSessions[i]);
            if (_activeSessions[_consumptionSessions[i]].state == false){
                _consumptionSessions[i] = _consumptionSessions[_consumptionSessions.length - 1];
                _consumptionSessions.pop();
            }
        }
    }

    function clearOldSession(string memory sessionID) private {
        ConsumptionSession memory session = _activeSessions[sessionID];
        if ( block.timestamp < session.timestamp + _parameters.H() && 
             session.wh > 0 && 
             session.state == true ){
            return; //Session still relevant, don't clear...
        }
        //Return locked ENT to consumer and lockeg Wh to storage unit :
        _ENT.unlockAmmount( session.consumer, session.unit, 99999999999999999); //Unlock locked ENT
        _storageUnits[session.unit].wh += session.wh; //Unlock locked Unit Wh
        _totalWh += session.wh;
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

    // Handle energy tokens >>>>>>>
    function energyTokenBalance(
        address addr
    ) public view returns (uint256 available, uint256 locked) {
        return (_ENT.balance(addr), _ENT.lockedBalance(addr));
    }

    function transferEnergyTokens(
        address from,
        address to,
        uint256 amnt
    ) public {
        require(
            msg.sender == _owner,
            "You are not authorized to execute this method"
        );
        _ENT.transfer(from, to, amnt);
    }

    function getTotalENT() public view returns (uint256 amnt) {
        return _ENT.total();
    }

    function getENTAddress() public view returns (address token) {
        return address(_ENT);
    }
}
