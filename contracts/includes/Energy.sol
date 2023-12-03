// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";

contract Energy{
    Token _ENT;
    Parameters internal _parameters;
    address private _owner;
    uint256 private _totalKwh;
    uint256 internal _storageUnitsNumber;
    address[] internal _storageUnitAddresses;
    string[] internal _consumptionSessions;
    
    mapping(address => Tools.StorageUnitInfo) internal _storageUnits;
    mapping(string => Tools.ConsumptionSession) internal _activeSessions;
    
    constructor(Parameters params) {
        _parameters = params;
        _owner = msg.sender;
        _ENT = new Token("ENT");
        _totalKwh = 0;
        _storageUnitsNumber = 0;
    }
    
    function registerUnit(address addr, address owner) public{
        Tools.check(msg.sender == _owner,"Not authorized to register new unit");
        _storageUnitsNumber += 1;
        _storageUnits[addr] = Tools.StorageUnitInfo(true,owner,0);
        _storageUnitAddresses.push(addr);
    }

    function disableStorageUnit(address addr) public{
        Tools.check(msg.sender == _owner,"Not authorized to diable storage units");
        _storageUnits[addr].state = false;
    }

    function getStorageUnits() public view returns(address[] memory) {
        return _storageUnitAddresses;
    }

    function getStorageUnitState(address addr) public view returns(bool){
        return _storageUnits[addr].state;
    }

    function getAvailableKwh(address addr) public view returns(uint256){
        return _storageUnits[addr].kwh;
    }

    function getBurnRate() public view returns(uint256){//ENT To be burned per kWh consumed
        uint256 loss = Tools.distance(_totalKwh, _ENT.total()) * _parameters.C();
        uint256 rate = 10**8 + loss;
        if (rate > _parameters.B()) return _parameters.B();
        else return rate;
    }
    function getMintRate() public view returns(uint256){ //ENT To be minter per kWh produced
        uint256 loss = Tools.distance(_totalKwh, _ENT.total()) * _parameters.C();
        if ( 10**8 > loss){
            if (10**8-loss < _parameters.M()) return _parameters.M();
            else return 10**8-loss;
        }
        else{
            return _parameters.M();
        }
    }

    function getConsumptionSessionID(address unit, address consumer) internal returns(string memory){
        return Tools.concat(unit,consumer);
    }

    function startConsumption(address unit,address consumer,uint256 entAmmount) public returns(string memory){
        Tools.check(msg.sender == _owner,"Not authorized to start a consumption session");
        Tools.check(_ENT.balance(consumer) >= entAmmount,"Not enough ENT tokens");
        Tools.check(_storageUnits[unit].state,"Storage Unit is disabled");
        Tools.check(_totalKwh > 0, "No energy available");

        uint256 rate = getBurnRate();
        uint256 kwh = entAmmount / rate * 10**18; //Get amount of kwh to be consumed
        Tools.check(_storageUnits[unit].kwh >= kwh,"No energy available in storage unit");

        _storageUnits[unit].kwh -= kwh; //Remove kwh to be consumsed from available kwh (not consumed yet just locked for consumtions)
        
        //Start a consumption session and lock ent ammount
        string memory consumptionSessionID = getConsumptionSessionID(unit,consumer);
        _activeSessions[consumptionSessionID] = Tools.ConsumptionSession(kwh,rate,block.timestamp,consumer);
        _consumptionSessions.push(consumptionSessionID);
        _ENT.lockAmmount(consumer,unit,entAmmount);
        return consumptionSessionID; //Return back the consumption session id
    }

    function getConsumptionSessionEnergy(address unit, address consumer) public returns(uint256){
        Tools.check(_storageUnits[unit].state, "Storage unit not active");
        string memory consumptionSessionID = getConsumptionSessionID(unit, consumer);
        return _activeSessions[consumptionSessionID].kwh;
    }

    function consume(address unit,address consumer,uint256 kwh) public returns(uint256){
        Tools.check(msg.sender == _owner,"You are not authorized to consume energy");
        Tools.check(_storageUnits[unit].state,"Storage unit not active");
        string memory sessionID = getConsumptionSessionID(unit,consumer);
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
        Tools.check(msg.sender == _owner,"You are not authorized to prodce energy");
        Tools.check(_storageUnits[unit].state,"Storage unit not active");
        _storageUnits[unit].kwh += kwh;
        _totalKwh += kwh;
        uint256 amnt = kwh * getMintRate();
        _ENT.mint(producer, amnt);
        return amnt;
    }
    function clearOldSessions() public{
        uint length = _consumptionSessions.length;
        for (uint256 i = 0; i < length; i++) {
            if (block.timestamp >= _activeSessions[_consumptionSessions[i]].timestamp + 2 hours) {
                //_activeSessions[_consumptionSessions[i]].

                _consumptionSessions[i] = _consumptionSessions[length - 1];
                _consumptionSessions.pop();
            }
        }
    }
}