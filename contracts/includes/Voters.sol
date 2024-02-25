// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Tools.sol";

contract Voters{

    struct VoteInfo{
        mapping(address => bool) userVotes; //Voter votes
        uint256 count; //Number of positive votes
        bool passed; //Vote passed
    }
    struct UserInfo{
        string vote;
        bool userVote;
        bool passed;
    }
    Tools _tools;
    mapping(string => VoteInfo) _votes; //Votes info
    mapping(address => string[]) internal _voterVotes; //Votes of a voter
    mapping(address => bool) internal _voters; //Voter addresses
    mapping(address => UserInfo[]) _userVoteStrings; //Keep all user vote strings
    mapping(address => mapping( string => uint)) _userVoteExists; //To check if vote exists
    uint _VotersNumber;
    address _owner;

    constructor(address addr, Tools tools) {
        _tools = tools;
        _voters[addr] = true;
        _VotersNumber = 1;
        _owner = msg.sender;
    }

    //Handle voters >>>>>
    function isVoter(address addr) public view returns (bool){
        return _voters[addr];
    }
    function add(address newVoter) public{
        require(msg.sender == _owner,"Not allowed to execute this method");
        _voters[newVoter] = true;
        _VotersNumber += 1;
    }
    function remove(address voter) public{
        require(msg.sender == _owner,"Not allowed to execute this method");
        require(_VotersNumber > 1,"Can't remove last voter");  //Can't remove Voter if it's only one...
        _voters[voter] = false;
        _VotersNumber -= 1;
    }

    //>>>> Voting system
    function startVote(address addr, string memory voteString) public returns (int) {
        require(msg.sender == _owner);
        require(isVoter(addr),"Not authorized to execute this method");
        //Avoid using vote strings that has been already passed in the past
        bool passed = isVotePassed(voteString);
        string memory availableVoteString = voteString;
        uint256 i = 1;
        while (passed){
            availableVoteString = 
                _tools.concat(voteString, 
                    _tools.concat("_",
                        _tools.uint2str(i)));
            passed = isVotePassed(availableVoteString);
            i += 1;
        }
        int vote = changeVote(addr, availableVoteString);
        if (isVotePassed(availableVoteString)){
            vote = 2; //Vote passed
        }
        return vote;
    }
    function getVotes(address addr) public view returns(UserInfo[] memory){
        require(msg.sender == _owner,"Not allowed to execute this method");
        require(_voters[addr],"You are not a voter");
        UserInfo[] memory votes = _userVoteStrings[addr];
        for(uint i = 0; i < votes.length; i++){
            votes[i].passed = isVotePassed(_userVoteStrings[addr][i].vote);
        }
        return votes;
    }
    function checkIfVoteIsPassed(uint count) internal view returns(bool){
        return ( (count*10 / _VotersNumber) > 5);
    }
    function changeVote(address addr, string memory vote) public returns (int){
        require(_voters[addr],"Not allowed to execute this method");
        _votes[vote].userVotes[addr] = !_votes[vote].userVotes[addr];
        int voteVal = -1;
        if (_votes[vote].userVotes[addr]) {
            _votes[vote].count += 1;
            voteVal = 1; //Vote possitive
        }
        else {
            _votes[vote].count -= 1;
            voteVal = 0; //Vote negative
        }
        bool passed = checkIfVoteIsPassed(_votes[vote].count);
        if (_userVoteExists[addr][vote] == 0){
            //User vote doesn't exist, create it
            _userVoteStrings[addr].push(UserInfo(vote,_votes[vote].userVotes[addr],passed));
            _userVoteExists[addr][vote] = _userVoteStrings[addr].length;
        }else{
            //User vote exists, change it
            _userVoteStrings[addr][_userVoteExists[addr][vote]-1] = UserInfo(vote,_votes[vote].userVotes[addr],passed);
        }
        _votes[vote].passed = passed;
        return voteVal;
    }
    function isVotePassed(string memory vote) public view returns (bool){
        return _votes[vote].passed;
    }

    //Votes:
    function VOTE_SET_PARAMETER(string memory param, uint256 value) public view returns(string memory){return _tools.concat(_tools.concat(_tools.concat("setParameter_", param), "_" ),value);}
    function VOTE_CHANGE_BANKER(address addr) public view returns(string memory){return _tools.concat("changeBankerTo_", addr);}
    function VOTE_ADD_VOTER(address addr) public view returns(string memory){return _tools.concat("Add_Voter_", addr);}
    function VOTE_REMOVE_VOTER(address addr) public view returns(string memory){return _tools.concat("Remove_Voter_", addr);}
    function VOTE_ADD_UNIT(address unit, address owner) public view returns(string memory){return _tools.concat( _tools.concat(_tools.concat("register_", unit), "_"), owner );}
    function VOTE_REMOVE_UNIT(address unit) public view returns(string memory){return _tools.concat("remove_", unit);}
    
    string public constant DESTOY_CONTACT = "destroy_contract";

}