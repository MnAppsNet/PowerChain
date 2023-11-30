// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

contract Token{
    mapping(address => uint256) private _balances;
    address private _owner;
    uint256 private _total;
    string private _name;

    constructor(string memory n) {
        _owner = msg.sender;
        _name = n;
        _total = 0;
    }

    function name() public view returns(string memory){
        return _name;
    }

    function balance(address addr) public view returns(uint256){
        return _balances[addr];
    }

    function mint(address addr,uint256 amnt) public returns(bool) {
        if (msg.sender != _owner){
            return false;
        }
        _balances[addr] += amnt;
        _total += amnt;
        return true;
    }

    function burn(address addr,uint256 amnt) public returns(bool) {
        if (msg.sender != _owner || _balances[addr] < amnt){
            return false;
        }
        _balances[addr] -= amnt;
        _total -= amnt;
        return true;
    }

}