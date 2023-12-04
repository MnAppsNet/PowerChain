// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./includes/Token.sol";
import "./includes/Voters.sol";
import "./includes/Tools.sol";
import "./includes/Energy.sol";

contract PowerChain{

    event Info(string info);
    Voters internal _Voters;
    Energy internal _energy;
    Parameters internal _parameters;
    Tools internal _tools;

    constructor( ) {
        _tools = new Tools();
        _parameters = new Parameters();
        _Voters = new Voters(msg.sender);
        _energy = new Energy(_parameters);
    }

    function getStorageUnits() external view returns (address[] memory){
        return _energy.getStorageUnits();
    }

    function getStorageUnitEnergy(address unit) external view returns (uint256){
        //Returns storage unit energy in kWh
        return _energy.getAvailableKwh(unit);
    }

    //Energy >>>>>>>
    function register(address unit, address owner) external{
        string memory voteString = 
            _tools.concat( 
                _tools.concat(
                    _tools.concat("register_", unit) , "_" ) , owner);
        if (startVote(voteString)){
            _energy.registerUnit(unit,owner);
            emit Info(_tools.concat("Storage unit registered >> ",unit));
        }
    }
    function startConsumptionSession(address storageUnit,uint256 entAmmount) external {
        //Start a consumption session
        string memory consumptionSessionID = _energy.startConsumption(storageUnit, msg.sender, entAmmount);
        emit Info(_tools.concat("Consumption session started >>", consumptionSessionID));
    }
    function getConsumptionSessionEnergy(address addr) external returns(uint256){
        //Get the available energy of a consumption session
        if (_energy.getStorageUnitState(addr))
            //addr is a storage unit provided by a consumer
            return _energy.getConsumptionSessionEnergy(addr,msg.sender);
        else
            //addr is a consumer provided by a storage unit
            return _energy.getConsumptionSessionEnergy(msg.sender,addr);
    }
    function clearOldSessions() external{
        
    }
    //Token >>>>>>>
    function transfer( address to, uint256 amnt ) external{
        _energy.transferEnergyTokens(msg.sender, to, amnt * 10**8);
    }
    function balance(address addr) external view returns(uint256 available, uint256 locked){
        return _energy.energyTokenBalance(addr);
    }

    //Voting >>>>>>>
    function startVote(string memory voteString) internal returns(bool){
        _tools.check(_Voters.isVoter(msg.sender),"Not authorized to execute this method");
        int vote = _Voters.changeVote(msg.sender, voteString);
        _tools.check(vote != -1,"Not authorized to execute this method");
        emit Info((vote==1)?
            _tools.concat(_tools.concat("You are in favor of: '",voteString),"'. Execute the method again to change your mind."):
            _tools.concat(_tools.concat("You are against of: '",voteString),"'. Execute the method again to change your mind"));
        return _Voters.votePassed(voteString);
    }
    function addVoter(address addr) external{
        if(startVote(_tools.concat("Add_Voter_", addr))){
            _Voters.add(addr);
            emit Info(_tools.concat("New voter added >> ",addr));
        }
    }
    function removeVoter(address addr) external{
        if(startVote(_tools.concat("Remove_Voter_", addr))){
            _Voters.add(addr);
            emit Info(_tools.concat("Voter removed >> ",addr));
        }
    }
    
    //Contract >>>>>>>
    function destroy() external{
        if(startVote("destroy_contract")){
            emit Info("Vote passed. Contract is destroyed.");
            this.destroy();
        }
    }
}