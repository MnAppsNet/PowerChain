// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

import "./Token.sol";
import "./Tools.sol";

contract Trade {
    struct Order {
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
    uint256 lastBuyId;
    uint256 lastSellId;

    constructor(Token ent, Token eEuro, Tools tools) {
        owner = msg.sender;
        _ENT = ent;
        _eEuro = eEuro;
        _tools = tools;
        lastBuyId = 0;
        lastSellId = 0;
    }

    // Add order in order book
    function addOrder(address addr, uint256 price, uint256 ENT, bool isBuy) public {
        require(owner == msg.sender,"Not allowed to execute this method");
        uint256 id = 0;
        if (isBuy) {
            uint256 eEuro = price / _tools.multiplier() * ENT;
            require(_eEuro.balance(addr) >= eEuro, "Not enough eEuro available");
            _eEuro.lockAmmount(addr, address(this), eEuro);
            id = lastBuyId;
            lastBuyId += 1;
        }
        else {
            require(_ENT.balance(addr) >= ENT, "Not enough ENT available");
            _ENT.lockAmmount(addr, address(this), ENT);
            id = lastSellId;
            lastSellId += 1;
        }
        
        Order memory order = Order(msg.sender, price, ENT, true);
        orderBook[isBuy][id] = order;
        matchOrders();
    }

    // Remove order from order book
    function removeOrder(address addr, uint256 id, bool isBuy) public{
        if (orderBook[isBuy][id].user == addr && orderBook[isBuy][id].valid){
            if (isBuy){
                 uint256 eEuro = orderBook[isBuy][id].price / _tools.multiplier() * orderBook[isBuy][id].quantity;
                _eEuro.unlockAmmount(orderBook[isBuy][id].user, address(this), eEuro);
            }else{
                _eEuro.unlockAmmount(orderBook[isBuy][id].user, address(this), orderBook[isBuy][id].quantity);
            }
            delete orderBook[isBuy][id];
            orderBook[isBuy][id].valid = false;
        }
    }

    // Continuously match buy and sell orders
    function matchOrders() public {
        for (uint256 i = 0; i < lastBuyId; i++) {
            for (uint256 j = 0; j < lastSellId; j++) {
                if (orderBook[true][i].price >= orderBook[false][j].price) {
                    // Match orders if prices align
                    uint256 matchedQuantity = _tools.min(orderBook[true][i].quantity, orderBook[false][j].quantity);
                    uint256 eEuroCost = matchedQuantity / _tools.multiplier() * orderBook[false][j].price;
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
    }
}