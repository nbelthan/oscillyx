// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./libs/Base64Simple.sol";

/**
 * @title Oscillyx10K
 * @dev 10,000 unique color variations of a single high-quality style
 * One style. Infinite colors. Block-driven uniqueness.
 */
contract Oscillyx10K is ERC721A, ERC2981, Ownable, Pausable, EIP712 {
    using ECDSA for bytes32;

    // ============ CONSTANTS ============
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 constant TAU_MILLI = 6283; // 2π * 1000
    uint256 constant SCALE = 1000;
    
    bytes32 public constant MINT_AUTH_TYPEHASH = keccak256(
        "MINT_AUTH(address to,uint256 deadline,uint8 sourceId,uint64 nonce)"
    );
    
    // ============ CORE STORAGE ============
    
    struct Meta {
        uint32 blockNo;
        uint16 indexInBlock;
        bytes16 seed;
        uint8 sourceId;
        address referrer;
    }
    
    mapping(uint256 => Meta) public meta;
    mapping(uint32 => uint16) public blockCount;
    mapping(uint32 => bytes32) public blockDigest;
    
    // ============ COLOR PALETTES (20 THEMES) ============
    
    struct ColorPalette {
        string name;
        string startColor;
        string endColor;
        string bgColor;
        uint8 glowIntensity;
    }
    
    // ============ EIP-712 SIGNATURE SYSTEM ============
    
    address public authorizedSigner;
    mapping(address => uint64) public nonces;
    mapping(bytes32 => bool) public usedSignatures;
    
    // ============ MINTING CONTROLS ============
    
    bool public mintingActive = false;
    uint256 public maxPerTx = 5;
    string private _contractURI;
    bool public metadataFrozen = false;

    // ============ EVENTS ============
    
    event Minted(
        address indexed to, 
        uint256 indexed tokenId, 
        uint32 blockNo, 
        uint16 indexInBlock, 
        uint8 sourceId, 
        address indexed referrer
    );
    
    event CohortUpdated(uint32 indexed blockNo, uint16 newSize, bytes32 newDigest);

    // ============ CONSTRUCTOR ============
    
    constructor(
        address signer_,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator,
        string memory contractURI_
    ) 
        ERC721A("Oscillyx10K", "OSC10K") 
        EIP712("Oscillyx10K", "1")
    {
        authorizedSigner = signer_;
        _contractURI = contractURI_;
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    // ============ COLOR PALETTE DEFINITIONS ============
    
    function _getColorPalette(uint256 index) internal pure returns (ColorPalette memory) {
        if (index == 0) return ColorPalette("Neon Flame", "#FF6A00", "#FFD966", "#1a1718", 40);
        if (index == 1) return ColorPalette("Electric Blue", "#00D4FF", "#0066FF", "#0a0a1a", 45);
        if (index == 2) return ColorPalette("Plasma Purple", "#FF00FF", "#7B00FF", "#1a0a1a", 42);
        if (index == 3) return ColorPalette("Toxic Green", "#00FF00", "#66FF00", "#0a1a0a", 38);
        if (index == 4) return ColorPalette("Ruby Red", "#FF0040", "#FF6666", "#1a0a0a", 40);
        if (index == 5) return ColorPalette("Golden Hour", "#FFD700", "#FFA500", "#1a1510", 35);
        if (index == 6) return ColorPalette("Silver Chrome", "#E6E6E6", "#FFFFFF", "#0f0e10", 30);
        if (index == 7) return ColorPalette("Rose Gold", "#FFB6C1", "#FFC0CB", "#1a1015", 36);
        if (index == 8) return ColorPalette("Copper Wire", "#B87333", "#FF8C42", "#15100a", 34);
        if (index == 9) return ColorPalette("Deep Ocean", "#003366", "#0099CC", "#0a0a15", 38);
        if (index == 10) return ColorPalette("Emerald Glow", "#00FF88", "#00CC66", "#0a1510", 40);
        if (index == 11) return ColorPalette("Sunset Blaze", "#FF4500", "#FF8C00", "#1a0f0a", 42);
        if (index == 12) return ColorPalette("Aurora", "#00FFCC", "#FF00FF", "#0a0a1a", 44);
        if (index == 13) return ColorPalette("Vapor Wave", "#FF6EC7", "#00FFFF", "#1a0a1a", 43);
        if (index == 14) return ColorPalette("Matrix Green", "#00FF41", "#008F11", "#0a0f0a", 41);
        if (index == 15) return ColorPalette("Quantum Violet", "#9D00FF", "#4B0082", "#0f0a1a", 40);
        if (index == 16) return ColorPalette("Neon Pink", "#FF1493", "#FF69B4", "#1a0a15", 42);
        if (index == 17) return ColorPalette("Holographic", "#00FFFF", "#FF00FF", "#0f0f1a", 46);
        if (index == 18) return ColorPalette("Fire Opal", "#FF3300", "#FFCC00", "#1a0a0a", 44);
        return ColorPalette("Ice Crystal", "#B0E0E6", "#E0FFFF", "#0a0f1a", 32);
    }
    
    // ============ RARITY DETERMINATION ============
    
    function _getRarity(bytes32 seed) internal pure returns (string memory) {
        uint256 rarityRoll = uint256(seed) & 0xFFFF;
        if (rarityRoll < 2) return "Legendary"; // ~0.02%
        if (rarityRoll < 40) return "Epic"; // ~0.37%
        if (rarityRoll < 630) return "Rare"; // ~5.9%
        return "Common"; // ~93.8%
    }
    
    // ============ TRIG FUNCTIONS WITH LUT ============
    
    function _getLUTValue(uint256 idx) internal pure returns (int256) {
        // Simplified 64-entry quarter-wave table
        if (idx < 16) {
            uint256[16] memory lut1 = [uint256(0), 98, 195, 290, 382, 471, 556, 636, 712, 782, 845, 903, 954, 997, 1033, 1062];
            return int256(lut1[idx]);
        }
        if (idx < 32) {
            uint256[16] memory lut2 = [uint256(1083), 1098, 1107, 1110, 1107, 1098, 1083, 1062, 1033, 997, 954, 903, 845, 782, 712, 636];
            return int256(lut2[idx - 16]);
        }
        if (idx < 48) {
            uint256[16] memory lut3 = [uint256(556), 471, 382, 290, 195, 98, 0, 98, 195, 290, 382, 471, 556, 636, 712, 782];
            return -int256(lut3[idx - 32]);
        }
        uint256[16] memory lut4 = [uint256(845), 903, 954, 997, 1033, 1062, 1083, 1098, 1107, 1110, 1107, 1098, 1083, 1062, 1033, 997];
        return -int256(lut4[idx - 48]);
    }
    
    function _sinFromLUT(int256 angleMilli) internal pure returns (int256) {
        int256 norm = angleMilli % int256(TAU_MILLI);
        if (norm < 0) norm += int256(TAU_MILLI);
        
        uint256 idx = (uint256(norm) * 64) / TAU_MILLI;
        return _getLUTValue(idx % 64);
    }
    
    function _cosFromLUT(int256 angleMilli) internal pure returns (int256) {
        return _sinFromLUT(angleMilli + int256(TAU_MILLI / 4));
    }

    // ============ MINTING FUNCTIONS ============
    
    function mintWithSignature(
        address to,
        uint256 qty,
        uint256 deadline,
        uint8 sourceId,
        uint64 nonce,
        address referrer,
        bytes calldata signature
    ) external whenNotPaused {
        require(mintingActive, "Minting not active");
        require(qty > 0 && qty <= maxPerTx, "Invalid quantity");
        require(_totalMinted() + qty <= MAX_SUPPLY, "Exceeds max supply");
        require(block.timestamp <= deadline, "Signature expired");
        require(nonce == nonces[msg.sender]++, "Invalid nonce");
        
        // Verify signature
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            MINT_AUTH_TYPEHASH,
            to,
            deadline,
            sourceId,
            nonce
        )));
        
        require(!usedSignatures[digest], "Signature already used");
        usedSignatures[digest] = true;
        
        address signer = digest.recover(signature);
        require(signer == authorizedSigner, "Invalid signature");
        
        // Mint logic
        uint32 currentBlock = uint32(block.number);
        uint256 startTokenId = _nextTokenId();
        
        for (uint256 i = 0; i < qty; i++) {
            uint256 tokenId = startTokenId + i;
            uint16 indexInBlock = blockCount[currentBlock]++;
            
            bytes16 seed = bytes16(keccak256(abi.encodePacked(
                to,
                tokenId,
                block.prevrandao,
                currentBlock,
                indexInBlock
            )));
            
            meta[tokenId] = Meta({
                blockNo: currentBlock,
                indexInBlock: indexInBlock,
                seed: seed,
                sourceId: sourceId,
                referrer: referrer
            });
            
            // Update block digest
            blockDigest[currentBlock] = keccak256(
                abi.encodePacked(blockDigest[currentBlock], to, tokenId)
            );
            
            emit Minted(to, tokenId, currentBlock, indexInBlock, sourceId, referrer);
        }
        
        emit CohortUpdated(currentBlock, blockCount[currentBlock], blockDigest[currentBlock]);
        
        _safeMint(to, qty);
    }

    // ============ ON-CHAIN METADATA & RENDERING ============
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        Meta memory tokenMeta = meta[tokenId];
        
        // Generate SVG with unique colors
        string memory svg = _generateColorVariation(tokenMeta, tokenId);
        
        // Get metadata
        bytes32 fullSeed = keccak256(abi.encode(tokenMeta.seed, tokenMeta.blockNo));
        uint256 paletteIndex = uint256(fullSeed) % 20;
        ColorPalette memory palette = _getColorPalette(paletteIndex);
        string memory rarity = _getRarity(fullSeed);
        
        // Build JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Oscillyx10K #',
            _toString(tokenId),
            '","description":"One style. Infinite colors. 10,000 unique on-chain variations.",',
            '"image":"data:image/svg+xml;base64,',
            Base64Simple.encode(bytes(svg)),
            '","attributes":[',
            '{"trait_type":"Palette","value":"', palette.name, '"},',
            '{"trait_type":"Rarity","value":"', rarity, '"},',
            '{"trait_type":"Block","value":', _toString(tokenMeta.blockNo), '},',
            '{"trait_type":"Index","value":', _toString(tokenMeta.indexInBlock), '},',
            '{"trait_type":"Cohort Size","value":', _toString(blockCount[tokenMeta.blockNo]), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64Simple.encode(bytes(json))
        ));
    }
    
    function _generateColorVariation(Meta memory tokenMeta, uint256 tokenId) internal view returns (string memory) {
        uint16 cohortSize = blockCount[tokenMeta.blockNo];
        bytes32 digest = blockDigest[tokenMeta.blockNo];
        bytes32 fullSeed = keccak256(abi.encode(tokenMeta.seed, tokenMeta.blockNo));
        
        // Determine color palette
        uint256 paletteIndex = uint256(fullSeed) % 20;
        ColorPalette memory palette = _getColorPalette(paletteIndex);
        
        // Determine rarity and effects
        string memory rarity = _getRarity(fullSeed);
        bool isLegendary = keccak256(bytes(rarity)) == keccak256(bytes("Legendary"));
        bool isEpic = keccak256(bytes(rarity)) == keccak256(bytes("Epic"));
        bool isRare = keccak256(bytes(rarity)) == keccak256(bytes("Rare"));
        
        // Determine ghost count based on cohort size
        uint8 ghosts = cohortSize >= 9 ? 3 : cohortSize >= 5 ? 2 : cohortSize >= 3 ? 1 : 0;
        
        // Generate main path
        string memory mainPath = _generatePath(
            uint256(keccak256(abi.encode(tokenMeta.seed, tokenMeta.blockNo, tokenMeta.indexInBlock))),
            tokenMeta.indexInBlock,
            false
        );
        
        // Generate ghost paths
        string memory ghostPaths = "";
        for (uint8 i = 0; i < ghosts; i++) {
            string memory ghostPath = _generatePath(
                uint256(keccak256(abi.encode(tokenMeta.seed, tokenMeta.blockNo, tokenMeta.indexInBlock, i))),
                tokenMeta.indexInBlock,
                true
            );
            
            uint256 strokeWidth = 8 + i * 2;
            uint256 opacity = 12 + i * 6;
            
            ghostPaths = string(abi.encodePacked(
                ghostPaths,
                '<path d="', ghostPath,
                '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="',
                _toString(strokeWidth),
                '" fill="none" opacity="0.',
                _toString(opacity),
                '"/>'
            ));
        }
        
        // Build gradient with potential modifications for rarity
        string memory gradient = _buildGradient(palette, isLegendary, isEpic, isRare);
        
        // Calculate glow parameters
        uint256 stdDev = palette.glowIntensity / 5 + (isLegendary ? 3 : isEpic ? 2 : isRare ? 1 : 0);
        uint256 glowWidth = 21 + (isLegendary ? 5 : isEpic ? 3 : isRare ? 1 : 0);
        
        // Build complete SVG
        return string(abi.encodePacked(
            '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            gradient,
            '<filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">',
            '<feGaussianBlur stdDeviation="', _toString(stdDev), '"/>',
            '</filter>',
            '<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">',
            '<path d="M0 0 L0 6" stroke="#000" stroke-opacity=".05" stroke-width="1"/>',
            '</pattern>',
            _getSpecialEffects(isLegendary, isEpic),
            '</defs>',
            '<rect width="512" height="512" fill="', palette.bgColor, '"/>',
            '<rect width="512" height="512" fill="url(#hatch)" opacity=".06"/>',
            _getSpecialBackground(isLegendary, isEpic),
            ghostPaths,
            '<path d="', mainPath, '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="',
            _toString(glowWidth),
            '" fill="none" opacity="', isLegendary ? '.45' : isEpic ? '.42' : '.38',
            '" filter="url(#softGlow)"/>',
            '<path d="', mainPath, '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" opacity=".95"/>',
            '</svg>'
        ));
    }
    
    function _generatePath(uint256 seed, uint16 indexInBlock, bool isGhost) internal pure returns (string memory) {
        // Derive Lissajous parameters
        uint256 Ax = isGhost ? 40 + (seed % 120) : 80 + (seed % 200);
        uint256 Ay = isGhost ? 40 + ((seed >> 8) % 120) : 80 + ((seed >> 8) % 200);
        uint256 fx = 2 + ((seed >> 16) % (isGhost ? 5 : 6));
        uint256 fy = 2 + ((seed >> 24) % (isGhost ? 5 : 7));
        int256 phx = int256((seed >> 32) % TAU_MILLI);
        int256 phy = int256((seed >> 40) % TAU_MILLI);
        
        // Add phase separation for ghosts
        if (isGhost) {
            phx = (phx + int256(TAU_MILLI / 3)) % int256(TAU_MILLI);
        }
        
        // Add index-based variation
        Ax = Ax + 5 + 7 * indexInBlock;
        Ay = Ay + 5 + 7 * indexInBlock;
        fx = 2 + ((fx + indexInBlock) % 6);
        
        // Generate path (simplified for gas optimization)
        bytes memory pathData = 'M';
        uint256 prevX = 0;
        uint256 prevY = 0;
        
        for (uint256 i = 0; i < 120; i += 3) { // Reduced from 240 for gas optimization
            int256 t = int256((i * 1000) / 119);
            int256 angleX = (int256(fx) * t * 2 * 3142) / 1000 + phx;
            int256 angleY = (int256(fy) * t * 2 * 3142) / 1000 + phy;
            
            int256 sinX = _sinFromLUT(angleX % int256(TAU_MILLI));
            int256 cosY = _cosFromLUT(angleY % int256(TAU_MILLI));
            
            uint256 x = 256 + uint256((int256(Ax) * sinX) / 1000);
            uint256 y = 256 + uint256((int256(Ay) * cosY) / 1000);
            
            if (isGhost) {
                x = (x / 2) * 2;
                y = (y / 2) * 2;
            }
            
            if (i == 0) {
                pathData = abi.encodePacked(pathData, _toString(x), ' ', _toString(y));
            } else if (i % 9 == 0) {
                uint256 cx = (prevX + x) / 2;
                uint256 cy = (prevY + y) / 2;
                pathData = abi.encodePacked(
                    pathData,
                    ' Q', _toString(cx), ' ', _toString(cy),
                    ' ', _toString(x), ' ', _toString(y)
                );
            }
            
            prevX = x;
            prevY = y;
        }
        
        return string(pathData);
    }
    
    function _buildGradient(ColorPalette memory palette, bool isLegendary, bool isEpic, bool isRare) 
        internal pure returns (string memory) {
        
        if (isLegendary) {
            // Multi-stop gradient with shimmer
            return string(abi.encodePacked(
                '<linearGradient id="g0">',
                '<stop offset="0%" stop-color="', palette.startColor, '">',
                '<animate attributeName="stop-color" values="',
                palette.startColor, ';#FFFFFF;', palette.startColor,
                '" dur="3s" repeatCount="indefinite"/>',
                '</stop>',
                '<stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.8"/>',
                '<stop offset="100%" stop-color="', palette.endColor, '">',
                '<animate attributeName="stop-color" values="',
                palette.endColor, ';#FFFFFF;', palette.endColor,
                '" dur="3s" repeatCount="indefinite"/>',
                '</stop>',
                '</linearGradient>'
            ));
        } else if (isEpic) {
            // Golden tinted gradient
            return string(abi.encodePacked(
                '<linearGradient id="g0">',
                '<stop offset="0%" stop-color="', palette.startColor, '"/>',
                '<stop offset="50%" stop-color="#FFD700" stop-opacity="0.6"/>',
                '<stop offset="100%" stop-color="', palette.endColor, '"/>',
                '</linearGradient>'
            ));
        } else if (isRare) {
            // Silver tinted gradient
            return string(abi.encodePacked(
                '<linearGradient id="g0">',
                '<stop offset="0%" stop-color="', palette.startColor, '"/>',
                '<stop offset="50%" stop-color="#E6E6E6" stop-opacity="0.4"/>',
                '<stop offset="100%" stop-color="', palette.endColor, '"/>',
                '</linearGradient>'
            ));
        } else {
            // Standard gradient
            return string(abi.encodePacked(
                '<linearGradient id="g0">',
                '<stop offset="0%" stop-color="', palette.startColor, '"/>',
                '<stop offset="100%" stop-color="', palette.endColor, '"/>',
                '</linearGradient>'
            ));
        }
    }
    
    function _getSpecialEffects(bool isLegendary, bool isEpic) internal pure returns (string memory) {
        if (isLegendary) {
            return '<pattern id="shimmer" width="4" height="4" patternUnits="userSpaceOnUse">'
                   '<rect width="2" height="2" fill="#fff" opacity=".3"/>'
                   '</pattern>';
        } else if (isEpic) {
            return '<radialGradient id="radialGlow">'
                   '<stop offset="0%" stop-color="#FFD700" stop-opacity=".3"/>'
                   '<stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>'
                   '</radialGradient>';
        }
        return '';
    }
    
    function _getSpecialBackground(bool isLegendary, bool isEpic) internal pure returns (string memory) {
        if (isLegendary) {
            return '<rect width="512" height="512" fill="url(#shimmer)" opacity=".1"/>';
        } else if (isEpic) {
            return '<circle cx="256" cy="256" r="200" fill="url(#radialGlow)" opacity=".05"/>';
        }
        return '';
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setMintingActive(bool active) external onlyOwner {
        mintingActive = active;
    }
    
    function setMaxPerTx(uint256 max) external onlyOwner {
        maxPerTx = max;
    }
    
    function setSigner(address signer) external onlyOwner {
        authorizedSigner = signer;
    }
    
    function setContractURI(string memory uri) external onlyOwner {
        require(!metadataFrozen, "Metadata frozen");
        _contractURI = uri;
    }
    
    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
    }
    
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    // ============ ROYALTY FUNCTIONS ============
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721A, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}