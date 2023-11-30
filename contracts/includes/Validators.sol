// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

contract Validators{
    mapping(address => bool) private _validators;

    constructor(address addr) {
        _validators[addr] = true;
    }

    function isValidator(address addr) public view returns (bool){
        return _validators[addr];
    }

    function add(address requester, address newValidator) public returns (bool){
        if (isValidator(requester)){
            _validators[newValidator] = true;
            return true;
        }
        return false;
    }

    function remove(address requester, address newValidator) public returns (bool){
        if (isValidator(requester)){
            _validators[newValidator] = false;
            return true;
        }
        return false;
    }
}