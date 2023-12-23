// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

contract Voters{

    mapping(address => bool) internal _Voters;
    mapping(bytes => bool) internal _votes;
    mapping(string => uint) internal _voteCounts;
    uint _VotersNumber;
    address _owner;

    constructor(address addr) {
        _Voters[addr] = true;
        _VotersNumber = 1;
        _owner = msg.sender;
    }

    function isVoter(address addr) public view returns (bool){
        return _Voters[addr];
    }

    function add(address newVoter) public{
        require(msg.sender == _owner,"Not allowed to add new voter");
        _Voters[newVoter] = true;
        _VotersNumber += 1;
    }

    function remove(address voter) public{
        require(msg.sender == _owner,"Not allowed to remove voters");
        require(_VotersNumber > 1,"Can't remove last voter");  //Can't remove Voter if it's only one...
        _Voters[voter] = false;
    }

    //>>>> Voting system
    function getVoteBytes(address addr, string memory vote) internal pure returns(bytes memory){
        return abi.encodePacked(addr,vote);
    }

    function changeVote(address addr, string memory vote) public returns (int){
        require(_Voters[addr],"Not allowed to vote");
        bytes memory voteBytes = getVoteBytes(addr, vote);
        _votes[voteBytes] = !_votes[voteBytes];
        if (_votes[voteBytes]) {
            _voteCounts[vote] += 1;
            return 1; //Vote possitive
        }
        else {
            _voteCounts[vote] -= 1;
            return 0; //Vote negative
        }
    }
    function getVote(address addr,string memory vote) public view returns (bool){
        return _votes[getVoteBytes(addr, vote)];
    }

    function votePassed(string memory vote) public view returns (bool){
        return ( (_voteCounts[vote] / _VotersNumber)*10 > 5);
    }
}