// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./includes/Token.sol";
import "./includes/Voters.sol";
import "./includes/Tools.sol";
import "./includes/Energy.sol";
import "./includes/Banker.sol";
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
        _banker = new Banker();
        _parameters = new Parameters();
        _Voters = new Voters(msg.sender);
        _energy = new Energy(_parameters);
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

    function getStorageUnitEnergy(
        address unit
    ) external returns (uint256 unitEnergy) {
        //Returns storage unit energy in kWh
        try _energy.getAvailableKwh(unit) returns (uint256 energy) {
            return energy;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }

    function getTotalKwh() external returns (uint256 kwh) {
        try _energy.getTotalKwh() returns (uint256 totalKwh) {
            return totalKwh;
        } catch Error(string memory reason) {
            emit Error(reason);
        }
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
    function getUserConsumptionSessions(address addr) external view returns (Energy.UserConsumptionSession[] memory userSessions){
        return _energy.getUserConsumptionSessions(addr);
    }

    function getStorageUnitsInfo() external view returns (Energy.StorageUnitInfo[] memory){
        return _energy.getStorageUnitsInfo();
    }

    function getConsumptionSessionEnergy(
        address addr
    ) external returns (uint256 sessionKwh) {
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
        try _energy.getConsumptionSessionEnergy(msg.sender, addr) returns (
            uint256 kwh
        ) {
            return kwh;
        } catch Error(string memory reason){
            emit Error(reason);
        }
    }
    function energyProduced(address producer, uint256 kwh) external {
        if (!_energy.getStorageUnitState(msg.sender)) {
            emit Error("Method can be called only by active storage units");
            return;
        }
        try _energy.produce(msg.sender, producer, kwh) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }

    function energyConsumed(address consumer, uint kwh) external {
        if (!_energy.getStorageUnitState(msg.sender)) {
            emit Error("Method can be called only by active storage units");
            return;
        }
        try _energy.consume(msg.sender, consumer, kwh) {} catch Error(
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

    //-------------------------------------------------------------------------------
    //Token >>>>>>>
    function transferENT(address to, uint256 amnt) external {
        try
            _energy.transferEnergyTokens(
                msg.sender,
                to,
                amnt * _tools.multiplier()
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
            _banker.transfereEuro(msg.sender, to, amnt * _tools.multiplier())
        {} catch Error(string memory reason) {
            emit Error(reason);
        }
    }

    function lockeEuro(uint256 amnt) external {
        try _banker.lockeEuro(msg.sender, amnt * _tools.multiplier()) {} catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }

    function balanceeEuro()
        external
        returns (uint256 available, uint256 locked)
    {
        try _banker.energyTokenBalance(msg.sender) returns (
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
        try _banker.geteEuroAddress() returns (address eEuroAddr) {
            return eEuroAddr;
        } catch Error(string memory reason) {
            emit Error(reason);
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
        if (!_Voters.isVoter(msg.sender)) {
            emit Error("Not authorized to execute this method");
            return false;
        }
        //Avoid using vote strings that has been already passed in the past
        bool passed = _Voters.isVotePassed(voteString);
        string memory availableVoteString = voteString;
        uint256 i = 1;
        while (passed){
            availableVoteString = 
                _tools.concat(voteString, 
                    _tools.concat("_",
                        _tools.uint2str(i)));
            passed = _Voters.isVotePassed(availableVoteString);
            i += 1;
        }
        int vote = 0;
        try _Voters.changeVote(msg.sender, availableVoteString) returns (int v) {
            vote = v;
        } catch Error(string memory reason) {
            emit Error(reason);
            return false;
        }
        emit Info(
            (vote == 1)
                ? _tools.concat(
                    _tools.concat("You are in favor of: '", availableVoteString),
                    "'. Execute the method again to change your mind."
                )
                : _tools.concat(
                    _tools.concat("You are against of: '", availableVoteString),
                    "'. Execute the method again to change your mind"
                )
        );
        try _Voters.isVotePassed(availableVoteString) returns (bool passedVote) {
            return passedVote;
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