// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";

contract Banker{
    Token internal _eEuro;
    mapping(address=>bool) private _owners;
    address _banker;
    Tools _tools;
    constructor( Token eEuro, Tools tools ) {
        _tools = tools;
        _owners[msg.sender] = true;
        _eEuro = eEuro;
        _banker = address(0); //No banker initially
    }
    function getBanker() public view returns(address){
        return _banker;
    }
    function changeBanker(address addr) public{
        require(_owners[msg.sender],"You are not authorized to execute this method");
        _banker = addr;
    }
    function minteEuro(address bnk, address addr, uint256 amnt) public {
        require(_owners[msg.sender],"You are not authorized to execute this method");
        require(bnk == _banker, "Only banker can mint eEuro");
        _eEuro.mint(addr, amnt);
    }
    function burnLockedeEuro(address addr, uint256 amnt) public {
        require(_owners[msg.sender],"You are not authorized to execute this method");
        require(addr == _banker, "Only banker can burn locked eEuro");
        require(_eEuro.balanceLockedFromContractor(addr, address(this)) >= amnt, "Not enough locked eEuro");
        _eEuro.unlockAmmount(addr, address(this), amnt);
        _eEuro.burn(addr, amnt);
    }
    function lockeEuro(address addr, uint256 amnt) public{
        require(_owners[msg.sender],"You are not authorized to execute this method");
        _eEuro.lockAmmount(addr, address(this), amnt);
    }
    function unlockeEuro(address addr, uint256 amnt) public{
        require(_owners[msg.sender],"You are not authorized to execute this method");
        require(addr == _banker, "Only banker can unlock locked eEuro");
        _eEuro.unlockAmmount(addr, address(this), amnt);
    }

}