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
import "./includes/Trade.sol";

contract PowerChain {
    event Error(string error);
    event Info(string info);
    
    Token internal _ENT;
    Token internal _eEuro;
    Voters internal _Voters;
    Energy internal _energy;
    Parameters internal _parameters;
    Banker internal _banker;
    Tools internal _tools;
    Trade internal _trade;

    constructor() {
        _tools = new Tools();
        _ENT = new Token("ENT");
        _eEuro = new Token("eEuro");
        _parameters = new Parameters(_tools);
        _energy = new Energy(_parameters,_tools,_ENT);
        _banker = new Banker(_eEuro, _tools);
        _Voters = new Voters(msg.sender,_tools);
        _trade = new Trade(_ENT,_eEuro,_tools);
        //Set authorizations :
        _ENT.addOwner(address(_energy));
        _ENT.addOwner(address(_trade));
        _eEuro.addOwner(address(_banker));
        _eEuro.addOwner(address(_trade));
    }

    //-------------------------------------------------------------------------------
    //Energy >>>>>>>
    function getTotalEnergy() external view returns (uint256 wh) {
        return _energy.getTotalEnergy();
    }
    function getEnergyCosts() external view returns(uint256 mint, uint256 burn){
        return (_energy.getMintingCost(),_energy.getBurningCost());
    }
    function registerStorageUnit(address unit, address owner) external {
        if (_energy.getStorageUnitState(unit)) {
            emit Error(_tools.UNIT_ALREADY_ACTIVE());
            return;
        }
        if (startVote(_Voters.VOTE_ADD_UNIT(unit,owner))) {
            try _energy.registerUnit(unit, owner) {
                emit Info(_tools.UNIT_REGISTERED(unit));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function removeStorageUnit(address unit) external {
        if (!_energy.getStorageUnitState(unit)) {
            emit Error(_tools.UNIT_NOT_ACTIVE());
            return;
        }
        if (startVote(_Voters.VOTE_REMOVE_UNIT(unit))) {
            try _energy.disableStorageUnit(unit) {
                emit Info(_tools.UNIT_DISABLED((unit)));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function startConsumptionSession( address storageUnit, uint256 entAmmount) external {
        //Start a consumption session
        try
            _energy.startConsumption(storageUnit, msg.sender, entAmmount)
        returns (string memory consumptionSessionID) {
            emit Info(_tools.SESSION_STARTED(consumptionSessionID));
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
    function getConsumptionSessionEnergy( address addr ) view external returns (uint256 sessionWh) {
        return _energy.getConsumptionSessionEnergy(msg.sender, addr);
    }
    function energyProduced(address producer, uint256 wh) external {
        try _energy.produce(msg.sender, producer, wh) {} catch Error(
            string memory reason ) {
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
        if (!_parameters.isValidParam(param)){
            emit Error(_tools.INVALID_PARAM(param));
            return;
        }
        if (startVote(_Voters.VOTE_SET_PARAMETER(param,value))) {
            try _parameters.setParameter(param,value) {
                emit Info(_tools.PARAM_SET(param,value));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    //-------------------------------------------------------------------------------
    //Banker >>>>>>>
    function getBankerAddress() external view returns(address){
        return _banker.getBanker();
    }
    function changeBanker(address addr) external {
        if (startVote(_Voters.VOTE_CHANGE_BANKER(addr))) {
            try _banker.changeBanker(addr) {
                emit Info(_tools.BANKER_CHANGED(addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function minteEuro(address addr, uint256 amnt) external {
        try _banker.minteEuro(msg.sender, addr, amnt) {
            emit Info(_tools.EEURO_MINTED(addr,amnt));
        } catch Error( string memory reason ) {
            emit Error(reason);
        }
    }
    function burneEuro(address addr, uint amnt) external {
        try _banker.burnLockedeEuro(addr, amnt) {
            emit Info(_tools.EEURO_BURNED(addr,amnt));
        } catch Error( string memory reason ) {
            emit Error(reason);
        }
    }
    function getTotalEeuro() external view returns (uint256){
        return _eEuro.total();
    }
    //-------------------------------------------------------------------------------
    //Token >>>>>>>
    function transferENT(address to, uint256 amnt) external {
        try
            _ENT.transfer( msg.sender, to, amnt )
        {} catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function balanceENT() external returns (uint256 available, uint256 locked) {
        try _ENT.totalBalance(msg.sender) returns ( uint256 avail,  uint256 lock ) {
            return (avail, lock);
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function transfereEuro(address to, uint256 amnt) external {
        try _eEuro.transfer(msg.sender, to, amnt)
        {} catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function lockeEuro(uint256 amnt) external {
        try _banker.lockeEuro(msg.sender, amnt) {
            emit Info(_tools.EEURO_LOCKED(amnt));
        } catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function unlockeEuro(address addr, uint256 amnt) external {
        try _banker.unlockeEuro(addr, amnt) {
            emit Info(_tools.EEURO_UNLOCKED(addr,amnt));
        } catch Error(
            string memory reason
        ) {
            emit Error(reason);
        }
    }
    function balanceeEuro()
        external
        returns (uint256 available, uint256 locked)
    {
        try _eEuro.totalBalance(msg.sender) returns (
            uint256 avail,
            uint256 lock
        ) {
            return (avail, lock);
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function getTotalENT() external view returns (uint256 amnt){
        return _ENT.total();
    }
    //-------------------------------------------------------------------------------
    //Voting >>>>>>>
    function isVoter() external view returns (bool voter) {
        return _Voters.isVoter(msg.sender);
    }
    function getVotes() external view returns (Voters.UserInfo[] memory voterVotes){
        return _Voters.getVotes(msg.sender);
    }
    function startVote(string memory voteString) internal returns (bool votePassed) {
        try _Voters.startVote(msg.sender,voteString) returns (int vote) {
            if (vote == 2){
                //Vote Passed
                return true;
            }
            emit Info(_tools.VOTE(vote,voteString));
            return false;
        } catch Error(string memory reason) {
            emit Error(reason);
            return false;
        }
    }
    function addVoter(address addr) external {
        if (startVote(_Voters.VOTE_ADD_VOTER(addr))) {
            try _Voters.add(addr) {
                emit Info(_tools.VOTER_ADDED(addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }
    function removeVoter(address addr) external {
        if (!_Voters.isVoter(addr)) {
            emit Error(_tools.NOT_VOTER());
            return;
        }
        if (startVote(_Voters.VOTE_REMOVE_VOTER(addr))) {
            try _Voters.remove(addr) {
                emit Info(_tools.VOTER_REMOVED(addr));
            } catch Error(string memory reason) {
                emit Error(reason);
            }
        }
    }

    //-------------------------------------------------------------------------------
    //Trading >>>>>>>
    function getOrders() external view returns(Trade.Order[] memory,Trade.Order[] memory) {
        return _trade.getOrders();
    }
    function addOrder(uint256 price, uint256 quant, bool isBuy) external{
        try _trade.addOrder(msg.sender, price, quant,isBuy) {
            emit Info(_tools.ORDER_ADDED());
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }
    function removeOrder(uint256 id, bool isBuy) external{
        try _trade.removeOrder(msg.sender, id, isBuy) {
            emit Info(_tools.ORDER_REMOVED());
        } catch Error(string memory reason) {
            emit Error(reason);
        }
    }

    //-------------------------------------------------------------------------------
    //Contract >>>>>>>
    function destroy() external {
        if (startVote(_Voters.DESTOY_CONTACT())) {
            emit Info(_tools.CONTACT_DESTOYED());
            this.destroy();
        }
    }
}