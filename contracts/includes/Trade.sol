// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";

contract Trade {
    struct Order {
        uint id;
        address user;
        uint256 price;
        uint256 quantity;
        bool valid;
    }

    // Order book for buy and sell orders, True = Buy, False = Sell
    mapping(bool => mapping(uint256 => Order)) public orderBook;
    address owner;
    Token _ENT;
    Token _eEuro;
    Tools _tools;
    uint256 _lastBuyId;
    uint256 _lastSellId;

    constructor(Token ent, Token eEuro, Tools tools) {
        owner = msg.sender;
        _ENT = ent;
        _eEuro = eEuro;
        _tools = tools;
        _lastBuyId = 0;
        _lastSellId = 0;
    }
    
    function getOrders() public view returns(Order[] memory,Order[] memory){
        require( owner == msg.sender, "You are not authorized to execute this method" );
        uint buyLength = _lastBuyId;
        uint sellLength = _lastSellId;
        Order memory tempOrder;
        Order[] memory buyOrders = new Order[](buyLength);
        Order[] memory sellOrders = new Order[](sellLength);
        //Get Buy Orders
        uint j = 0;
        for (uint i=0; i < buyLength; i++) {
            tempOrder = orderBook[true][i];
            if (!tempOrder.valid) {
                if (buyOrders.length > 0) 
                    assembly { mstore(buyOrders, sub(mload(buyOrders), 1)) }
                continue; //Keep only active sessions
            }
            buyOrders[j] = tempOrder;
            j += 1;
        }
        //Get Sell Orders
        j = 0;
        for (uint i=0; i < sellLength; i++) {
            tempOrder = orderBook[false][i];
            if (!tempOrder.valid) {
                if (sellOrders.length > 0) 
                    assembly { mstore(sellOrders, sub(mload(sellOrders), 1)) }
                continue; //Keep only active sessions
            }
            sellOrders[j] = tempOrder;
            j += 1;
        }
        return (buyOrders,sellOrders);
    }

    // Add order in order book
    function addOrder(address addr, uint256 price, uint256 ENT, bool isBuy) public {
        require(owner == msg.sender,"Not allowed to execute this method");
        uint256 id = 0;
        if (isBuy) {
            uint256 eEuro = price * ENT / _tools.multiplier();
            require(_eEuro.balance(addr) >= eEuro, "Not enough eEuro available");
            _eEuro.lockAmmount(addr, address(this), eEuro);
            id = _lastBuyId;
            _lastBuyId += 1;
        }
        else {
            require(_ENT.balance(addr) >= ENT, "Not enough ENT available");
            _ENT.lockAmmount(addr, address(this), ENT);
            id = _lastSellId;
            _lastSellId += 1;
        }
        
        Order memory order = Order(id, addr, price, ENT, true);
        orderBook[isBuy][id] = order;
        matchOrders(1);
    }

    // Remove order from order book
    function removeOrder(address addr, uint256 id, bool isBuy) public{
        require(orderBook[isBuy][id].user == addr,"Order doesn't belong to you");
        require(orderBook[isBuy][id].valid,"Order is not valid");
        if (isBuy){
             uint256 eEuro = orderBook[isBuy][id].price * orderBook[isBuy][id].quantity / _tools.multiplier();
            _eEuro.unlockAmmount(orderBook[isBuy][id].user, address(this), eEuro);
        }else{
            _ENT.unlockAmmount(orderBook[isBuy][id].user, address(this), orderBook[isBuy][id].quantity);
        }
        delete orderBook[isBuy][id];
        orderBook[isBuy][id].valid = false;
    }

    // Continuously match buy and sell orders
    function matchOrders() public{
        matchOrders(0);
    }
    function matchOrders(uint level) public {
        //CDA trading algorithm
        for (uint256 i = 0; i < _lastBuyId; i++) {
            for (uint256 j = 0; j < _lastSellId; j++) {
                if (orderBook[true][i].user == orderBook[false][j].user) continue; //Don't much orders of the same user...
                if (orderBook[true][i].price >= orderBook[false][j].price) {
                    // Match orders if prices align
                    uint256 matchedQuantity = _tools.min(orderBook[true][i].quantity, orderBook[false][j].quantity);
                    uint256 eEuroCost = matchedQuantity * orderBook[false][j].price / _tools.multiplier();
                    //Check assets availability
                    if (_ENT.lockedBalance(orderBook[false][j].user) < matchedQuantity) continue; //Check if seller has enough ENT tokens
                    if (_eEuro.lockedBalance(orderBook[true][i].user) < eEuroCost) continue; //Check if buyer has enough eEuro tokens
                    //Unlock assets
                    _ENT.unlockAmmount(orderBook[false][j].user, address(this), matchedQuantity);
                    _eEuro.unlockAmmount(orderBook[true][i].user, address(this), eEuroCost);
                    _ENT.transfer(orderBook[false][j].user, orderBook[true][i].user, matchedQuantity);
                    _eEuro.transfer(orderBook[true][i].user, orderBook[false][j].user, eEuroCost);

                    orderBook[true][i].quantity -= matchedQuantity;
                    orderBook[false][j].quantity -= matchedQuantity;
                    if (orderBook[true][i].quantity == 0) {
                        delete orderBook[true][i];
                        orderBook[true][i].valid = false;
                    }
                    if (orderBook[false][j].quantity == 0) {
                        delete orderBook[false][j];
                        orderBook[false][j].valid = false;
                    }
                }
            }
        }
        if (level > 0) matchOrders(level-1);
    }
}