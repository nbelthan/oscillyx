// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Base64Simple
 * @dev Simple, reliable base64 encoding without complex assembly
 */
library Base64Simple {
    string private constant _TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        // Calculate the length of the encoded string
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        
        // Create the encoded string
        bytes memory result = new bytes(encodedLen);
        bytes memory table = bytes(_TABLE);
        
        uint256 j = 0;
        for (uint256 i = 0; i < data.length; i += 3) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = i + 1 < data.length ? uint256(uint8(data[i + 1])) : 0;
            uint256 c = i + 2 < data.length ? uint256(uint8(data[i + 2])) : 0;
            
            uint256 bitmap = (a << 16) | (b << 8) | c;
            
            result[j++] = table[(bitmap >> 18) & 63];
            result[j++] = table[(bitmap >> 12) & 63];
            result[j++] = i + 1 < data.length ? table[(bitmap >> 6) & 63] : bytes1(uint8(61)); // '='
            result[j++] = i + 2 < data.length ? table[bitmap & 63] : bytes1(uint8(61)); // '='
        }
        
        return string(result);
    }
}