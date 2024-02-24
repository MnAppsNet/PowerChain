// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Tools.sol";

contract Parameters {
    Tools _tools;
    address _owner;
    uint256 public M; //Minimum minting rate
    uint256 public B; //Maximum burning rate
    uint256 public C; //Missing energy recover rate
    uint256 public H; //Hours to keep consumsion session active
    uint256 public F; //Storage provider fee (amount of ent for storage provider cut)
    string[] parameterStrings;

    constructor( Tools tools){
        parameterStrings = ['M','B','C','H','F'];
        //Default values
        _tools = tools;
        _owner = msg.sender;
        M = 50 * _tools.multiplier() / 100; //0.5 ENT
        B = 50 * _tools.multiplier() / 100; //0.5 ENT
        C = 5 * _tools.multiplier()  / 100; //5%
        H = 2 hours;
        F = 20 * _tools.multiplier() / 100;  //20%
    }
    function isValidParam(string memory param) view public returns(bool){
        uint length = parameterStrings.length;
        for(uint i = 0; i < length; i++){
            if (_tools.equal(parameterStrings[i], param))
                return true;
        }
        return false;
    }
    function setParameter(string memory param,uint256 value) public {
        require(_owner == msg.sender,"You are not allowed to change contract parameters");
        if (_tools.equal(param, parameterStrings[0])){ //Set M
            setM(value);
        }
        else if (_tools.equal(param, parameterStrings[1])){ //Set B
            setB(value);
        }
        else if (_tools.equal(param, parameterStrings[2])){ //Set C
            setC(value);
        }
        else if (_tools.equal(param, parameterStrings[3])){ //Set H
            setH(value);
        }
        else if (_tools.equal(param, parameterStrings[4])){ //Set F
            setF(value);
        }
    }
    function setM(uint256 m) public {
        require(_owner == msg.sender,"You are not allowed to change contract parameters");
        M = m;
    }
    function setB(uint256 b) public {
        require(_owner == msg.sender,"You are not allowed to change contract parameters");
        B = b;
    }
    function setC(uint256 c) public {
        require(_owner == msg.sender,"You are not allowed to change contract parameters");
        C = c;
    }
    function setH(uint256 h) public{
        require(_owner == msg.sender,"You are not allowed to change contract parameters");
        H = h * 3600;
    }
    function setF(uint256 f) public{
        require(_owner == msg.sender,"You are not allowed to change contract parameters");
        F = f;
    }
}