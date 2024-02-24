// SPDX-License-Identifier: MIT
// Author: Emmanouil Kalyvas
pragma solidity ^0.8.0;

contract Tools {
    uint256 public constant multiplier = 10 ** 18; //Used to handle fixed point numbers

    function toAsciiString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2 ** (8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }
    function min(uint256 a, uint256 b) public pure returns (uint256) {
        return a < b ? a : b;
    }
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
    function concat(string memory a, string memory b, string memory c) public pure returns (string memory) {
        return concat(concat(a, b),c);
    }
    function concat(string memory a, address b) public pure returns (string memory) {
        return concat(a, toAsciiString(b));
    }
    function concat(address a, address b) public pure returns (string memory) {
        return concat(toAsciiString(a), toAsciiString(b));
    }

    function concat(string memory a, string memory b
    ) public pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function concat(string memory a, uint256 b
    ) public pure returns (string memory) {
        return string(abi.encodePacked(a, uint2str(b)));
    }
    function concat(uint256 a, string memory b
    ) public pure returns (string memory) {
        return string(abi.encodePacked(uint2str(a), b));
    }

    function equal( string memory a, string memory b ) public pure returns (bool) {
        return (keccak256(abi.encodePacked(a)) ==
            keccak256(abi.encodePacked(b)));
    }

    function distance(uint256 a, uint256 b) public pure returns (uint256) {
        if (a > b) return a - b;
        else return b - a;
    }

    function uint2str(uint256 i) public pure returns (string memory str) {
        if (i == 0) {
            return "0";
        }
        uint256 j = i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }

    //Strings:
    function UNIT_REGISTERED(address unit) public pure returns(string memory){return concat("Storage unit registered >> ", unit);}
    function UNIT_DISABLED(address unit) public pure returns(string memory){return concat("Storage unit disabled >> ", unit);}
    function SESSION_STARTED(string memory consumptionSessionID) public pure returns(string memory){return concat("Consumption session started >>",consumptionSessionID);}
    function INVALID_PARAM(string memory param) public pure returns(string memory){return concat("Given param is not valid >>",param);}
    function PARAM_SET(string memory param, uint256 value) public pure returns(string memory){return concat(concat("Parameter ", param, " set to "),value);}
    function BANKER_CHANGED(address addr) public pure returns(string memory){return concat("Banker changed to >> ", addr);}
    function EEURO_MINTED(address addr, uint256 amnt) public pure returns(string memory){return concat(concat(amnt/multiplier, " eEuro minted into "),addr);}
    function EEURO_BURNED(address addr, uint256 amnt) public pure returns(string memory){return concat(concat(amnt/multiplier, " eEuro burned from "),addr);}
    function EEURO_LOCKED(uint256 amnt) public pure returns(string memory){return concat(amnt, " eEuro locked");}
    function EEURO_UNLOCKED(address addr, uint256 amnt) public pure returns(string memory){return concat(concat(amnt, " eEuro unlocked into "),addr);}
    function VOTE(int vote, string memory voteString) public pure returns(string memory){
        return (vote == 1)
                ? concat(
                    concat("You are in favor of: '", voteString),
                    "'. Execute the method again to change your mind."
                )
                : concat(
                    concat("You are against of: '", voteString),
                    "'. Execute the method again to change your mind"
                );
    }
    function VOTER_ADDED(address addr) public pure returns(string memory){return concat("New voter added >> ", addr);}
    function VOTER_REMOVED(address addr) public pure returns(string memory){return concat("Voter removed >> ", addr);}

    string public constant UNIT_ALREADY_ACTIVE = "Storage unit is already active...";
    string public constant UNIT_NOT_ACTIVE = "Storage unit is not active...";
    string public constant USER_ALREADY_VOTER = "User is already a voter...";
    string public constant NOT_VOTER = "User is not a voter...";
    string public constant ORDER_ADDED = "Order added in the order book";
    string public constant ORDER_REMOVED = "Order removed from the order book";
    string public constant CONTACT_DESTOYED = "Vote passed. Contract is destroyed.";

}
