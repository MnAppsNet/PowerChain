// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Energy.sol";

contract Storage{
    struct StorageUnitInfo {
        //Information about a storage unit
        bool state;
        address owner;
        uint256 wh;
    }
    Energy _energy;
    address private _owner; //The owner of this contract
    mapping(address => uint256) internal _storageUnitLockedEnergy; //The locked energy of each storage unit
    mapping(address => StorageUnitInfo) public _storageUnits; //The info of each storage unit
    address[] public _storageUnitAddresses; //All the storage unit addresses that are active
    uint256 private _totalEnergy; //Total energy of the network (all storage units together)

    constructor(Energy energy) {
        _energy = energy;
        _totalEnergy = 0;
        _owner = msg.sender;
    }
    function removeNetworkEnergy(uint256 energy) private{
        if (energy > _totalEnergy) energy = _totalEnergy;
        _totalEnergy -= energy;
    }
    function addNetworkEnergy(uint256 energy) private{
        _totalEnergy += energy;
    }
    function registerUnit(address addr, address storageOwner) public {
        require(msg.sender == _owner, "Not authorized to execute this method");
        _storageUnits[addr] = StorageUnitInfo(true, storageOwner, 0);
        _storageUnitAddresses.push(addr);
    }
    function disableStorageUnit(address addr) public {
        require(msg.sender == _owner, "Not authorized to execute this method");
        _storageUnits[addr].state = false;
        //Remove inactive storage untit addresses:
        uint length = _storageUnitAddresses.length;
        for (uint256 i = 0; i < length; i++) {
            if (_storageUnits[_storageUnitAddresses[i]].state == false){
                _storageUnitAddresses[i] = _storageUnitAddresses[_storageUnitAddresses.length - 1];
                _storageUnitAddresses.pop();
                if (i>0) i--; 
                length--;
            }
        }
        removeNetworkEnergy(_storageUnits[addr].wh);
    }
    function storageUnitAddresses() public view returns (address[] memory){
        return _storageUnitAddresses;
    }
    function getStorageUnitsInfo() public view  returns (StorageUnitInfo[] memory) {
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
    function state (address unit) public view returns(bool){
        return _storageUnits[unit].state;
    }
    function owner (address unit) public view returns(address){
        return _storageUnits[unit].owner;
    }
    function availableEnergy(address unit) public view returns(uint256){
        //Returns only available energy of a unit that can be consumed
        return _storageUnits[unit].wh;
    }
    function totalEnergy(address unit) public view returns(uint256){
        //Returns total energy of a unit, locked + available
        return _storageUnits[unit].wh + _storageUnitLockedEnergy[unit];
    }
    function totalNetworkEnergy() public view returns(uint256){
        return _totalEnergy;
    }
    function lockEnergy (address unit, uint256 energy) public{
        require(msg.sender == _owner, "Not authorized to execute this method");
        if (energy > _storageUnits[unit].wh) energy = _storageUnits[unit].wh;
        _storageUnits[unit].wh -= energy;
        _storageUnitLockedEnergy[unit] += energy;
        //Locked but not removed from total network energy until it's actually consumed
    }
    function unlockEnergy (address unit, uint256 energy) public{
        require(msg.sender == _owner, "Not authorized to execute this method");
        if (energy > _storageUnitLockedEnergy[unit]) energy = _storageUnitLockedEnergy[unit];
        _storageUnits[unit].wh += energy;
        _storageUnitLockedEnergy[unit] -= energy;
    }
    function consumeLockedEnergy(address unit,uint256 energy) public{
        require(msg.sender == _owner, "Not authorized to execute this method");
        if (energy > _storageUnitLockedEnergy[unit]) energy = _storageUnitLockedEnergy[unit];
        _storageUnitLockedEnergy[unit] -= energy;
        removeNetworkEnergy(energy);
    }
    function produceEnergy(address unit,uint256 energy) public{
        require(msg.sender == _owner, "Not authorized to execute this method");
        _storageUnits[unit].wh += energy;
        addNetworkEnergy(energy);
    }
    function balanceStorageUnitEnergy(address unit, uint256 actualEnergy) public {
        require( msg.sender == _owner, "You are not authorized to execute this method");
        require( state(unit), "Storage unit not active");
        uint256 difference = 0;
        uint256 totalUnitEnergy = totalEnergy(unit); //total energy both locked in sessions and unlocked
        if (actualEnergy >= totalUnitEnergy){
            //Unit has actually more (or equal) energy -> add it to the available unit energy
            difference = actualEnergy - totalUnitEnergy;
            _storageUnits[unit].wh += difference;
            addNetworkEnergy(difference);
            return;
        }
        //Unit has actually less energy, we need to cover the difference...
        difference = totalUnitEnergy - actualEnergy;
        if (_storageUnits[unit].wh >= difference){
            //If the unlocked wh are enough to cover the difference, remove the difference
            _storageUnits[unit].wh -= difference;
            removeNetworkEnergy(difference);
            return;
        }
        //Unlocked wh not enough to cover the difference, 
        //we need to clear existing consumption sessions that are in risk
        //as there is not enough energy to cover them
        _storageUnits[unit].state = false; //Set temporarily the unit state to false
        _energy.clearOldSessions(); //Clear sessions, unit sessios should be removed now as it's inactive
        _storageUnits[unit].state = true; //Re-enable storage unit
        if (_storageUnits[unit].wh >= difference){
            //Now we can cover the difference, remove it...
            _storageUnits[unit].wh -= difference;
            removeNetworkEnergy(difference);
            return;
        }
        //Difference can't be covered, remove all wh
        removeNetworkEnergy(_storageUnits[unit].wh);
        _storageUnits[unit].wh = 0;
    }
}