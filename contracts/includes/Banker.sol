// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";

contract Banker{
    Token internal _eEuro;
    address private _owner;
    address _banker;
    constructor( ) {
        _owner = msg.sender;
        _eEuro = new Token("eEuro");
        _banker = address(0);
    }
    function changeBanker(address addr) public{
        require(msg.sender == _owner,"You are not authorized to execute this method");
        _banker = addr;
    }
    function geteEuroAddress() public view returns(address token){
        return address(_eEuro);
    }
    function energyTokenBalance(address addr) public view returns(uint256 available,uint256 locked){
        return (_eEuro.balance(addr),_eEuro.lockedBalance(addr));
    }
    function transfereEuro(address from, address to, uint256 amnt) public {
        require(msg.sender == _owner,"You are not authorized to execute this method");
        _eEuro.transfer(from, to, amnt);
    }
    function minteEuro(address bnk, address addr, uint256 amnt) public {
        require(msg.sender == _owner,"You are not authorized to execute this method");
        require(bnk == _banker, "Only banker can mint eEuro");
        _eEuro.mint(addr, amnt);
    }
    function burnLockedeEuro(address addr, uint256 amnt) public {
        require(msg.sender == _owner,"You are not authorized to execute this method");
        require(addr == _banker, "Only banker can burn locked eEuro");
        require(_eEuro.balanceLockedFromContractor(addr, _banker) > amnt, "Not enough locked eEuro");
        _eEuro.unlockAmmount(addr, _banker, amnt);
        _eEuro.burn(addr, amnt);
    }
    function lockeEuro(address addr, uint256 amnt) public{
        require(msg.sender == _owner,"You are not authorized to execute this method");
        _eEuro.lockAmmount(addr, _banker, amnt);
    }

}