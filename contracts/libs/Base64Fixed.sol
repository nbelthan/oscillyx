// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Base64Fixed
 * @dev Provides base64 encoding functionality - FIXED VERSION
 * The original Base64.sol had a critical bug in the assembly loop condition
 */
library Base64Fixed {
    string internal constant _TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // Load the table into memory
        string memory table = _TABLE;

        // Calculate result length  
        uint256 encodedLen = ((data.length + 2) / 3) * 4;
        string memory result = new string(encodedLen + 32);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            let dataPtr := add(data, 32)  // Start at actual data, not length
            let endPtr := add(dataPtr, mload(data))  // End pointer

            for {
                let i := dataPtr
            } lt(i, endPtr) {  // FIXED: Compare with end pointer, not length
                i := add(i, 3)
            } {
                let input := and(mload(i), 0xffffff)

                let out := or(
                    or(
                        shl(18, and(shr(24, input), 0xFF)),
                        shl(12, and(shr(16, input), 0xFF))
                    ),
                    or(
                        shl(6, and(shr(8, input), 0xFF)),
                        and(input, 0xFF)
                    )
                )

                out := shl(224, out)

                mstore8(resultPtr, mload(add(tablePtr, and(shr(26, out), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(20, out), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(14, out), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(8, out), 0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            // Handle padding
            let remainder := mod(mload(data), 3)
            if iszero(iszero(remainder)) {
                let padChar := 0x3d  // '=' character
                if eq(remainder, 1) { 
                    mstore8(sub(resultPtr, 2), padChar)
                    mstore8(sub(resultPtr, 1), padChar)
                }
                if eq(remainder, 2) { 
                    mstore8(sub(resultPtr, 1), padChar)
                }
            }

            // Set proper length
            mstore(result, encodedLen)
        }

        return result;
    }
}