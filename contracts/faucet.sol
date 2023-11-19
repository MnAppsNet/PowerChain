// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity <= 0.8.20;

contract Faucet{
    
    address[] private _owners;
    mapping (address => uint) timeouts;
    
    event Withdrawal(address indexed to);
    event Deposit(address indexed from, uint amount);
    event OwnerAdded(address indexed addr);
    event OwnerRemoved(address indexed addr);
    
    constructor() {
        _owners.push(msg.sender);
    }
    
    function withdraw() external{
        //  Fill peer wallet. All peers can have maximum 50 ETH for gas
        //  Only allows one withdrawal every 30 mintues
        require(address(this).balance >= 50 ether, "Faucet out of Gas... Please reach out to a validator.");
        require(timeouts[msg.sender] <= block.timestamp - 30 minutes, "You can only withdraw once every 30 minutes. Please check back later.");
        require(msg.sender.balance >= 50 ether, "Your account is already full.");
        uint256 amount = 50 ether - msg.sender.balance;
        payable(msg.sender).transfer(amount);
        timeouts[msg.sender] = block.timestamp;
        
        emit Withdrawal(msg.sender);
    }
    
    receive() external payable {
        //Sending Tokens to this faucet fills it up
        emit Deposit(msg.sender, msg.value); 
    }
    
    function isOwner() private view returns (bool){
        //Check if sender is one of the contract owners
        for (uint256 i = 0; i < _owners.length; i++) {
            if (_owners[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }
    
    function destroy() external{
        //Destroys this smart contract and sends all remaining funds to the owner
        require(isOwner() == true, "Only the owner of this faucet can execute this method.");
        selfdestruct(payable(msg.sender));
    }

    function addOwner() external{
        //Add owner to the contract
        require(isOwner() == true, "Only the owner of this faucet can execute this method.");
        _owners.push(msg.sender);

        emit OwnerAdded(msg.sender);
    }

    function removeOwner() external{
        //Remove sender from the contract
        require(isOwner() == true, "Only the owner of this faucet can execute this method.");
        for (uint256 i = 0; i < _owners.length; i++) {
            if (_owners[i] == msg.sender) {
                _owners[i] = _owners[_owners.length - 1];
                _owners.pop();
                break;
            }
        }

        emit OwnerRemoved(msg.sender);
    }
}