// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

contract Parameters {
    uint256 public M; //Minimum minting rate
    uint256 public B; //Maximum burning rate
    uint256 public C; //Missing energy cover rate
    uint256 public H; //Hours to keep consumsion session active
    uint256 public F; //Storage provider fee (amount of ent for storage provider cut)
    constructor(){
        //Default values
        M = 0.01 * 10**18;
        B = 3 * 10**18;
        C = 0.1 * 10**18;
        H = 2 hours;
        F = 0.2 * 10**18;
    }
    function setM(uint256 m) public {
        M = m;
    }
    function setB(uint256 b) public {
        B = b;
    }
    function setC(uint256 c) public {
        C = c;
    }
    function setH(uint256 h) public{
        H = h * 3600;
    }
    function setF(uint256 f) public{
        F = f;
    }
}