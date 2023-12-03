// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Tools.sol";

contract Token{
    struct Wallet{
        uint256 available;
        uint256 locked;
        mapping(address => uint256) lockedFrom;
    }
    mapping(address => Wallet) private _balances;
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
    function total() public view returns(uint256){
        return _total; 
    }
    function balance(address addr) public view returns(uint256){
        return _balances[addr].available; 
    }
    function lockedBalance(address addr) public view returns(uint256){
        return _balances[addr].locked; 
    }
    function balanceLockedFromContractor(address addr, address contructor) public view returns(uint256){
        return _balances[addr].lockedFrom[contructor];
    }
    function mint(address addr,uint256 amnt) public{
        Tools.check(msg.sender == _owner, "You are not allowed to execute this method");
        _balances[addr].available += amnt;
        _total += amnt;
    }
    function burn(address addr,uint256 amnt) public{
        Tools.check(msg.sender == _owner, "You are not allowed to execute this method");
        Tools.check(_balances[addr].available >= amnt, "Not enough tokens to burn");
        _balances[addr].available -= amnt;
        _total -= amnt;
    }
    function lockAmmount(address addr, address contractor, uint256 amnt) public {
        //Lock tokens for a particular contract with a contractor
        Tools.check(msg.sender == _owner, "You are not allowed to execute this method");
        Tools.check(_balances[addr].available >= amnt, "Not enough tokens to lock");
        _balances[addr].available -= amnt;
        _balances[addr].locked += amnt;
        _balances[addr].lockedFrom[contractor] += amnt;
    }
    function unlockAmmount(address addr, address contractor, uint256 amnt) public {
        Tools.check(msg.sender == _owner, "You are not allowed to execute this method");
        Tools.check(_balances[addr].lockedFrom[contractor] >= amnt, "Not enough tokens to unlock");
        _balances[addr].locked -= amnt;
        _balances[addr].lockedFrom[contractor] -= amnt;
        _balances[addr].available += amnt;
    }
    function transfer(address from, address to, uint256 amnt) public{
        Tools.check(msg.sender == _owner, "You are not allowed to execute this method");
        Tools.check(_balances[from].available >= amnt, "Not enough balance for this transfer");
        _balances[from].available -= amnt;
        _balances[to].available += amnt;
    }

}