// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./includes/Token.sol";
import "./includes/Voters.sol";
import "./includes/Tools.sol";
import "./includes/Energy.sol";
import "./includes/Banker.sol";
import "./includes/Storage.sol";
import "./includes/Parameters.sol";

contract PowerChain {
    event Error(string error);
    event Info(string info);

    Voters internal _Voters;
    Energy internal _energy;
    Parameters internal _parameters;
    Banker internal _banker;
    Tools internal _tools;

    constructor() {
        _tools = new Tools();
        _banker = new Banker(_tools);
        _parameters = new Parameters(_tools);
        _Voters = new Voters(msg.sender,_tools);
        _energy = new Energy(_parameters,_tools);
    }

    //-------------------------------------------------------------------------------
    //Energy >>>>>>>
    function getStorageUnits() external returns (address[] memory units) {
        try _energy.getStorageUnits() returns (address[] memory storageUnits) {
            return storageUnits;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function getStorageUnitEnergy(address unit) external returns (uint256 unitEnergy) {
        //Returns storage unit energy in wh
        try _energy.getAvailableEnergy(unit) returns (uint256 energy) {
            return energy;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function getTotalEnergy() external returns (uint256 wh) {
        try _energy.getTotalEnergy() returns (uint256 totalWh) {
            return totalWh;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function getEnergyRates() external view returns(uint256 mint, uint256 burn){
        return (_energy.getMintRate(),_energy.getBurnRate());
    }
    function registerStorageUnit(address unit, address owner) external {
        if (_energy.getStorageUnitState(unit)) {
            emit Error("Storage unit is already active...");
            return;
        }
        string memory voteString = _tools.concat(
            _tools.concat(_tools.concat("register_", unit), "_"),
            owner
        );
        if (startVote(voteString)) {
            try _energy.registerUnit(unit, owner) {
                emit Info(_tools.concat("Storage unit registered >> ", unit));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function removeStorageUnit(address unit) external {
        if (!_energy.getStorageUnitState(unit)) {
            emit Error("Storage unit is not active...");
            return;
        }
        string memory voteString = _tools.concat("remove_", unit);
        if (startVote(voteString)) {
            try _energy.disableStorageUnit(unit) {
                emit Info(_tools.concat("Storage unit disabled >> ", unit));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function startConsumptionSession(
        address storageUnit,
        uint256 entAmmount
    ) external {
        //Start a consumption session
        try
            _energy.startConsumption(storageUnit, msg.sender, entAmmount)
        returns (string memory consumptionSessionID) {
            emit Info(
                _tools.concat(
                    "Consumption session started >>",
                    consumptionSessionID
                )
            );
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function getConsumptionSessions() external view returns (Energy.UserConsumptionSession[] memory userSessions){
        return _energy.getConsumptionSessions(msg.sender);
    }
    function getStorageUnitsInfo() external view returns (Storage.StorageUnitInfo[] memory){
        return _energy.getStorageUnitsInfo();
    }
    function getConsumptionSessionEnergy(
        address addr
    ) external returns (uint256 sessionWh) {
        //Get the available energy of a consumption session
        address unit;
        address consumer;
        if (_energy.getStorageUnitState(addr)) {
            //addr is a storage unit provided by a consumer
            unit = addr;
            consumer = msg.sender;
        } else {
            //addr is a consumer provided by a storage unit
            unit = msg.sender;
            consumer = addr;
        }
        try _energy.getConsumptionSessionEnergy(unit, consumer) returns (
            uint256 wh
        ) {
            return wh;
        } catch Error(string memory reason){
            emit Error(reason);
        }
    }
    function energyProduced(address producer, uint256 wh) external {
        try _energy.produce(msg.sender, producer, wh) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function energyConsumed(address consumer, uint wh) external {
        try _energy.consume(msg.sender, consumer, wh) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function clearOldSessions() external {
        try _energy.clearOldSessions() {} catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function reportActualEnergy(uint256 actualEnergy) external {
        //Report the actual stored energy in an energy unit
        try _energy.balanceStorageUnitEnergy(msg.sender,actualEnergy) {} catch Error(string memory reason) {
            emit Error(reason);
        }
    } 
    //-------------------------------------------------------------------------------
    //Parameters >>>>>>>
    function getParameters() external view returns(uint256 M, uint256 B, uint256 C, uint256 H, uint256 F) {
        return (_parameters.M(),_parameters.B(),_parameters.C(),_parameters.H(),_parameters.F() );
    }
    function setParameter(string memory param,uint256 value) external {
        string memory voteString = _tools.concat(_tools.concat( _tools.concat("setParameter_", param), "_" ),value);
        if (startVote(voteString)) {
            try _banker.changeBanker(addr) {
                emit Info(_tools.concat("Banker changed to >> ", addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    //-------------------------------------------------------------------------------
    //Banker >>>>>>>
    function changeBanker(address addr) external {
        string memory voteString = _tools.concat("changeBankerTo_", addr);
        if (startVote(voteString)) {
            try _banker.changeBanker(addr) {
                emit Info(_tools.concat("Banker changed to >> ", addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function minteEuro(address addr, uint256 amnt) external {
        try _banker.minteEuro(msg.sender, addr, amnt) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function burneEuro(address addr, uint amnt) external {
        try _banker.burnLockedeEuro(addr, amnt) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function getBankerAddress() external view returns (address) {
        return _banker.getBanker();
    }
    function getTotalEeuro() external view returns (uint256){
        return _banker.getTotalEeuro();
    }
    //-------------------------------------------------------------------------------
    //Token >>>>>>>
    function transferENT(address to, uint256 amnt) external {
        try
            _energy.transferEnergyTokens(
                msg.sender,
                to,
                amnt
            )
        {} catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function balanceENT() external returns (uint256 available, uint256 locked) {
        try _energy.energyTokenBalance(msg.sender) returns (
            uint256 avail,
            uint256 lock
        ) {
            return (avail, lock);
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function transfereEuro(address to, uint256 amnt) external {
        try
            _banker.transfereEuro(msg.sender, to, amnt)
        {} catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function lockeEuro(uint256 amnt) external {
        try _banker.lockeEuro(msg.sender, amnt) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function balanceeEuro()
        external
        returns (uint256 available, uint256 locked)
    {
        try _banker.eEuroBalance(msg.sender) returns (
            uint256 avail,
            uint256 lock
        ) {
            return (avail, lock);
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function entAddress() external returns (address addr) {
        try _energy.getENTAddress() returns (address entAddr) {
            return entAddr;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function eEuroAddress() external returns (address addr) {
        try _banker.getEeuroAddress() returns (address eEuroAddr) {
            return eEuroAddr;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function getTotalENT() external returns (uint256 amnt){
        try _energy.getTotalENT() returns(uint256 ent){
            return ent;
        } catch Error(string memory reason){
            emit Error((reason));
        }
    }
    //-------------------------------------------------------------------------------
    //Voting >>>>>>>
    function isVoter() external view returns (bool voter) {
        return _Voters.isVoter(msg.sender);
    }
    function getVotes() external returns (Voters.UserInfo[] memory voterVotes){
        try _Voters.getVotes(msg.sender) returns(Voters.UserInfo[] memory votes){
            return votes;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function startVote(string memory voteString) internal returns (bool votePassed) {
        try _Voters.startVote(msg.sender,voteString) returns (int vote) {
            if (vote == 2){
                //Vote Passed
                return true;
            }
            emit Info((vote == 1)
                ? _tools.concat(
                    _tools.concat("You are in favor of: '", voteString),
                    "'. Execute the method again to change your mind."
                )
                : _tools.concat(
                    _tools.concat("You are against of: '", voteString),
                    "'. Execute the method again to change your mind"
                ));
            return false;
        } catch Error(string memory reason) {
            emit Error(reason);
            return false;
        }
    }

    function addVoter(address addr) external {
        if (_Voters.isVoter(addr)) {
            emit Error("User is already a voter...");
            return;
        }
        if (startVote(_tools.concat("Add_Voter_", addr))) {
            try _Voters.add(addr) {
                emit Info(_tools.concat("New voter added >> ", addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }

    function removeVoter(address addr) external {
        if (!_Voters.isVoter(addr)) {
            emit Error("User is not a voter...");
            return;
        }
        if (startVote(_tools.concat("Remove_Voter_", addr))) {
            try _Voters.remove(addr) {
                emit Info(_tools.concat("Voter removed >> ", addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }

    //-------------------------------------------------------------------------------
    //Contract >>>>>>>
    function destroy() external {
        if (startVote("destroy_contract")) {
            emit Info("Vote passed. Contract is destroyed.");
            this.destroy();
        }
    }
}