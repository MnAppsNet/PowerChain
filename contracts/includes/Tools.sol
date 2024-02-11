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
        return string(abi.encodePacked(a, b));
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
}
