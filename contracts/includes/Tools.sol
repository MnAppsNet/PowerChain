// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

contract Parameters {
    uint256 public M; //Minimum minting rate
    uint256 public B; //Maximum burning rate
    uint256 public C; //Missing energy cover rate
    uint256 public H; //Hours to keep consumsion session active
    constructor(){
        //Default values
        M = 0.01 * 10**8;
        B = 3 * 10**8;
        C = 0.1 * 10**8;
        H = 2 hours;
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
}

library Tools{

    event Error(string error);

    function check(bool condition, string memory message) public{
        if (condition) return; //If condition is met, don't revert
        emit Error(message);
        revert(message);
    }

    struct StorageUnitInfo{
        //Information about a storage unit
        bool state;
        address owner;
        uint256 kwh;
    }
    struct ConsumptionSession{
        //Parameters of a consumsion session
        uint256 kwh;  //Available kwh to consume
        uint256 rate; //Burn rate
        uint256 timestamp;
        address consumer;
    }

    function toAsciiString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
    function concat(string memory a, address b) public pure returns(string memory){
        return concat(a,toAsciiString(b));
    }
    function concat(address a, address b) public pure returns(string memory){
        return concat(toAsciiString(a),toAsciiString(b));
    }
    function concat(string memory a, string memory b) public pure returns(string memory){
        return string(abi.encodePacked(a, b));
    }
    function equal(string memory a, string memory b) public pure returns(bool){
        return (keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b)));
    }
    function distance(uint256 a, uint256 b) public pure returns(uint256){
        if (a > b) return a - b;
        else return b - a;
    }
}