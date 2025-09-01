// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GeometryLib
 * @dev Mathematical functions for on-chain SVG generation
 * Optimized for gas efficiency with integer-only arithmetic
 */
library GeometryLib {
    // Fixed-point scale for trigonometry (65536 = 2^16)
    uint256 constant SCALE = 65536;
    
    /**
     * @dev Get sine table value for index 0-63
     * Values are sin(i * π/128) * 65536, rounded to nearest integer
     */
    function _getSinValue(uint256 index) internal pure returns (uint256) {
        if (index > 63) return 0; // Bounds check
        if (index == 0) return 0;
        if (index == 1) return 1608;
        if (index == 2) return 3216;
        if (index == 3) return 4821;
        if (index == 4) return 6424;
        if (index == 5) return 8022;
        if (index == 6) return 9616;
        if (index == 7) return 11204;
        if (index == 8) return 12785;
        if (index == 9) return 14359;
        if (index == 10) return 15924;
        if (index == 11) return 17479;
        if (index == 12) return 19024;
        if (index == 13) return 20557;
        if (index == 14) return 22078;
        if (index == 15) return 23586;
        if (index == 16) return 25080;
        if (index == 17) return 26558;
        if (index == 18) return 28020;
        if (index == 19) return 29466;
        if (index == 20) return 30893;
        if (index == 21) return 32302;
        if (index == 22) return 33692;
        if (index == 23) return 35061;
        if (index == 24) return 36410;
        if (index == 25) return 37736;
        if (index == 26) return 39040;
        if (index == 27) return 40320;
        if (index == 28) return 41576;
        if (index == 29) return 42806;
        if (index == 30) return 44011;
        if (index == 31) return 45190;
        if (index == 32) return 46341;
        if (index == 33) return 47464;
        if (index == 34) return 48559;
        if (index == 35) return 49624;
        if (index == 36) return 50660;
        if (index == 37) return 51665;
        if (index == 38) return 52639;
        if (index == 39) return 53581;
        if (index == 40) return 54491;
        if (index == 41) return 55368;
        if (index == 42) return 56212;
        if (index == 43) return 57022;
        if (index == 44) return 57798;
        if (index == 45) return 58538;
        if (index == 46) return 59244;
        if (index == 47) return 59914;
        if (index == 48) return 60547;
        if (index == 49) return 61145;
        if (index == 50) return 61705;
        if (index == 51) return 62228;
        if (index == 52) return 62714;
        if (index == 53) return 63162;
        if (index == 54) return 63572;
        if (index == 55) return 63943;
        if (index == 56) return 64277;
        if (index == 57) return 64571;
        if (index == 58) return 64827;
        if (index == 59) return 65043;
        if (index == 60) return 65220;
        if (index == 61) return 65358;
        if (index == 62) return 65457;
        if (index == 63) return 65516;
        return 0;
    }

    /**
     * @dev Fast sine approximation using lookup table
     * @param angle Angle in range [0, 255] representing [0, 2π)
     * @return Sine value scaled by 65536
     */
    function sin(uint256 angle) internal pure returns (int256) {
        angle = angle % 256; // Ensure angle is in [0, 255]
        
        if (angle <= 63) {
            return int256(_getSinValue(angle));
        } else if (angle <= 127) {
            return int256(_getSinValue(127 - angle));
        } else if (angle <= 191) {
            return -int256(_getSinValue(angle - 128));
        } else {
            return -int256(_getSinValue(255 - angle));
        }
    }

    /**
     * @dev Fast cosine approximation (cos(x) = sin(x + π/2))
     * @param angle Angle in range [0, 255] representing [0, 2π)
     * @return Cosine value scaled by 65536
     */
    function cos(uint256 angle) internal pure returns (int256) {
        return sin((angle + 64) % 256);
    }

    /**
     * @dev Generate Lissajous curve points
     * @param seed Random seed for curve parameters
     * @param numPoints Number of points to generate
     * @return points Array of x,y coordinates scaled to [0, 512]
     */
    function generateLissajous(bytes32 seed, uint256 numPoints) 
        internal 
        pure 
        returns (uint256[] memory points) 
    {
        points = new uint256[](numPoints * 2);
        
        // Extract parameters from seed
        uint256 ax = 80 + (uint256(seed) % 200);           // Amplitude X: [80, 280]
        uint256 ay = 80 + ((uint256(seed) >> 8) % 200);    // Amplitude Y: [80, 280] 
        uint256 fx = 2 + ((uint256(seed) >> 16) % 6);      // Frequency X: [2, 7]
        uint256 fy = 3 + ((uint256(seed) >> 24) % 6);      // Frequency Y: [3, 8]
        uint256 phx = (uint256(seed) >> 32) % 256;         // Phase X: [0, 255]
        uint256 phy = (uint256(seed) >> 40) % 256;         // Phase Y: [0, 255]

        for (uint256 i = 0; i < numPoints; i++) {
            uint256 t = (i * 256) / numPoints; // Map i to [0, 255]
            
            // x = 256 + ax * sin(fx * t + phx) / SCALE
            int256 sx = sin((fx * t + phx) % 256);
            uint256 x = 256 + uint256((int256(ax) * sx) / int256(SCALE));
            
            // y = 256 + ay * cos(fy * t + phy) / SCALE  
            int256 cy = cos((fy * t + phy) % 256);
            uint256 y = 256 + uint256((int256(ay) * cy) / int256(SCALE));
            
            points[i * 2] = x;
            points[i * 2 + 1] = y;
        }
    }

    /**
     * @dev Convert points array to SVG path string with quadratic curves
     * @param points Array of x,y coordinates
     * @return SVG path string
     */
    function pointsToPath(uint256[] memory points) internal pure returns (string memory) {
        if (points.length < 4) return "";
        
        bytes memory path = abi.encodePacked(
            "M", 
            toString(points[0]), 
            " ", 
            toString(points[1])
        );
        
        // Use quadratic curves every 3-4 points for compression
        for (uint256 i = 2; i + 3 < points.length; i += 6) {
            path = abi.encodePacked(
                path,
                " Q",
                toString(points[i]), " ", toString(points[i + 1]),
                " ", toString(points[i + 2]), " ", toString(points[i + 3])
            );
        }
        
        return string(path);
    }

    /**
     * @dev Calculate crossing count for complexity traits
     * @param fx Frequency X
     * @param fy Frequency Y  
     * @return Approximate number of self-intersections
     */
    function calculateCrossings(uint256 fx, uint256 fy) internal pure returns (uint256) {
        // Simple approximation: crossings ≈ (fx * fy) / 2
        return (fx * fy) / 2;
    }

    /**
     * @dev Detect symmetry from phase difference
     * @param phx Phase X
     * @param phy Phase Y
     * @return 0=None, 1=Mirror, 2=Radial
     */
    function detectSymmetry(uint256 phx, uint256 phy) internal pure returns (uint256) {
        uint256 diff = phx > phy ? phx - phy : phy - phx;
        if (diff < 8 || diff > 248) return 2; // Radial (near 0° or 360°)
        if (diff > 120 && diff < 136) return 1; // Mirror (near 180°/2 = 90°)
        return 0; // None
    }

    /**
     * @dev Convert uint to string (gas-optimized)
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}