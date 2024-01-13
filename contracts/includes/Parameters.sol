// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Tools.sol";

contract Parameters {
    Tools _tools;
    address _owner;
    uint256 public M; //Minimum minting rate
    uint256 public B; //Maximum burning rate
    uint256 public C; //Missing energy cover rate
    uint256 public H; //Hours to keep consumsion session active
    uint256 public F; //Storage provider fee (amount of ent for storage provider cut)
    constructor( Tools tools){
        //Default values
        _tools = tools;
        _owner = msg.sender;
        M = 1 * _tools.multiplier() / 100; //01%
        B = 3 * _tools.multiplier();
        C = 1 * _tools.multiplier() / 10;  //10%
        H = 2 hours;
        F = 2 * _tools.multiplier() / 10;  //20%
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