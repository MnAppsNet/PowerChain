// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./includes/Token.sol";
import "./includes/Validators.sol";

contract PowerChain{
    event Error(string error);
    Token _ENT; //Energy token
    Validators _validators;

    constructor( ) {
        _validators = new Validators(msg.sender);
        _ENT = new Token("ENT");
    }
    
    receive() external payable {
        //Sending Tokens to this contract initiate the token burning
        //emit Deposit(msg.sender, msg.value); 
    }
    
    function destroy() external{
        //Destroys this smart contract and sends all remaining funds to the owner
        //check(isOwner() == true, "Only the owner of this faucet can execute this method.");
        //selfdestruct(payable(msg.sender));
    }
}