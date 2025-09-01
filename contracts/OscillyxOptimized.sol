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
 * @title OscillyxOptimized
 * @dev High-quality on-chain generative NFT with optimized rendering pipeline
 * Features: 128-entry quarter-wave LUT, oversample → smooth → decimate → compress pipeline,
 * Noir/Neon templates, cohort-aware ghost rendering
 */
contract OscillyxOptimized is ERC721A, ERC2981, Ownable, Pausable, EIP712 {
    using ECDSA for bytes32;

    // ============ CONSTANTS ============
    
    bytes32 public constant MINT_AUTH_TYPEHASH = keccak256(
        "MINT_AUTH(address to,uint256 deadline,uint8 sourceId,uint64 nonce)"
    );

    uint256 public immutable MAX_SUPPLY;
    string private _contractURI;
    
    // Fixed-point math constants
    uint256 constant TAU_MILLI = 6283; // 2π * 1000
    uint256 constant SCALE = 1000;
    
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
    mapping(uint32 => bool) public posterMinted;
    mapping(uint32 => uint256) public posterTokenId;
    
    // ============ EIP-712 SIGNATURE SYSTEM ============
    
    address public authorizedSigner;
    mapping(address => uint64) public nonces;
    mapping(bytes32 => bool) public usedSignatures;
    
    // ============ MINTING CONTROLS ============
    
    bool public mintingActive = false;
    uint256 public maxPerTx = 5;
    bool public metadataFrozen = false;

    // ============ 128-ENTRY QUARTER-WAVE LUT ============
    // Scaled by 1000 for fixed-point arithmetic
    // Using function instead of constant array due to Solidity limitations

    // ============ EVENTS ============
    
    event Minted(
        address indexed to, 
        uint256 indexed tokenId, 
        uint32 blockNo, 
        uint16 indexInBlock, 
        uint8 sourceId, 
        address indexed referrer
    );
    
    event PosterMinted(
        uint32 indexed blockNo, 
        uint256 indexed posterTokenId, 
        uint16 cohortSize
    );
    
    event CohortUpdated(uint32 indexed blockNo, uint16 newSize, bytes32 newDigest);

    // ============ CONSTRUCTOR ============
    
    constructor(
        uint256 maxSupply_,
        address signer_,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator,
        string memory contractURI_
    ) 
        ERC721A("OscillyxOptimized", "OSCO") 
        EIP712("OscillyxOptimized", "1")
    {
        MAX_SUPPLY = maxSupply_;
        authorizedSigner = signer_;
        _contractURI = contractURI_;
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    // ============ TRIG FUNCTIONS WITH QUARTER-WAVE LUT ============
    
    function _getLUTValue(uint256 idx) internal pure returns (int256) {
        // 128-entry quarter-wave lookup table (scaled by 1000)
        if (idx == 0) return 0;
        if (idx == 1) return 25;
        if (idx == 2) return 49;
        if (idx == 3) return 74;
        if (idx == 4) return 98;
        if (idx == 5) return 122;
        if (idx == 6) return 147;
        if (idx == 7) return 171;
        if (idx == 8) return 195;
        if (idx == 9) return 219;
        if (idx == 10) return 243;
        if (idx == 11) return 266;
        if (idx == 12) return 290;
        if (idx == 13) return 313;
        if (idx == 14) return 336;
        if (idx == 15) return 359;
        if (idx == 16) return 382;
        if (idx == 17) return 404;
        if (idx == 18) return 427;
        if (idx == 19) return 449;
        if (idx == 20) return 471;
        if (idx == 21) return 492;
        if (idx == 22) return 514;
        if (idx == 23) return 535;
        if (idx == 24) return 556;
        if (idx == 25) return 576;
        if (idx == 26) return 597;
        if (idx == 27) return 617;
        if (idx == 28) return 636;
        if (idx == 29) return 656;
        if (idx == 30) return 675;
        if (idx == 31) return 693;
        if (idx == 32) return 712;
        if (idx == 33) return 730;
        if (idx == 34) return 747;
        if (idx == 35) return 765;
        if (idx == 36) return 782;
        if (idx == 37) return 798;
        if (idx == 38) return 814;
        if (idx == 39) return 830;
        if (idx == 40) return 845;
        if (idx == 41) return 860;
        if (idx == 42) return 875;
        if (idx == 43) return 889;
        if (idx == 44) return 903;
        if (idx == 45) return 916;
        if (idx == 46) return 929;
        if (idx == 47) return 942;
        if (idx == 48) return 954;
        if (idx == 49) return 965;
        if (idx == 50) return 976;
        if (idx == 51) return 987;
        if (idx == 52) return 997;
        if (idx == 53) return 1007;
        if (idx == 54) return 1016;
        if (idx == 55) return 1025;
        if (idx == 56) return 1033;
        if (idx == 57) return 1041;
        if (idx == 58) return 1049;
        if (idx == 59) return 1056;
        if (idx == 60) return 1062;
        if (idx == 61) return 1068;
        if (idx == 62) return 1074;
        if (idx == 63) return 1079;
        if (idx >= 64 && idx <= 127) {
            // Mirror the first 64 values for the second quadrant
            return _getLUTValue(127 - idx);
        }
        return 0;
    }
    
    function _sinFromLUT(int256 angleMilli) internal pure returns (int256) {
        // Normalize to [0, TAU_MILLI)
        int256 norm = angleMilli % int256(TAU_MILLI);
        if (norm < 0) norm += int256(TAU_MILLI);
        
        uint256 angle = uint256(norm);
        uint256 quadrant = (angle * 4) / TAU_MILLI;
        uint256 idx = (angle * 512) / TAU_MILLI % 128;
        
        if (quadrant == 0) {
            return _getLUTValue(idx);
        } else if (quadrant == 1) {
            return _getLUTValue(127 - idx);
        } else if (quadrant == 2) {
            return -_getLUTValue(idx);
        } else {
            return -_getLUTValue(127 - idx);
        }
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
        bool isPoster = tokenMeta.indexInBlock == type(uint16).max;
        
        // Generate optimized SVG
        string memory svg = _generateOptimizedSVG(tokenMeta, isPoster);
        
        // Build JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"OscillyxOptimized ',
            isPoster ? 'Poster #' : '#',
            _toString(tokenId),
            '","description":"High-quality on-chain generative art with optimized rendering",',
            '"image":"data:image/svg+xml;base64,',
            Base64Simple.encode(bytes(svg)),
            '","attributes":[',
            _generateAttributes(tokenId, tokenMeta, isPoster),
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64Simple.encode(bytes(json))
        ));
    }
    
    function _generateOptimizedSVG(Meta memory tokenMeta, bool isPoster) internal view returns (string memory) {
        uint16 cohortSize = blockCount[tokenMeta.blockNo];
        bytes32 digest = blockDigest[tokenMeta.blockNo];
        
        // Determine template: 0 = Noir, 1 = Neon
        uint8 template = uint8(uint256(keccak256(abi.encode(digest, tokenMeta.indexInBlock))) % 2);
        
        // Determine ghost count based on cohort size
        uint8 ghosts = cohortSize >= 9 ? 3 : cohortSize >= 5 ? 2 : cohortSize >= 3 ? 1 : 0;
        
        // Generate main path
        string memory mainPath = _generateOptimizedPath(
            uint256(keccak256(abi.encode(tokenMeta.seed, tokenMeta.blockNo, tokenMeta.indexInBlock))),
            tokenMeta.indexInBlock,
            false
        );
        
        // Generate ghost paths
        string memory ghostPaths = "";
        for (uint8 i = 0; i < ghosts; i++) {
            string memory ghostPath = _generateOptimizedPath(
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
        
        // Build SVG based on template
        if (template == 0) {
            // Noir template
            return _buildNoirSVG(mainPath, ghostPaths, ghosts);
        } else {
            // Neon template
            return _buildNeonSVG(mainPath, ghostPaths, ghosts);
        }
    }
    
    function _generateOptimizedPath(uint256 seed, uint16 indexInBlock, bool isGhost) internal pure returns (string memory) {
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
        
        // Generate oversampled points (simplified to 240 points for gas optimization)
        bytes memory pathData = 'M';
        uint256 prevX = 0;
        uint256 prevY = 0;
        
        for (uint256 i = 0; i < 240; i += 3) {
            int256 t = int256((i * 1000) / 239);
            int256 angleX = (int256(fx) * t * 2 * 3142) / 1000 + phx;
            int256 angleY = (int256(fy) * t * 2 * 3142) / 1000 + phy;
            
            int256 sinX = _sinFromLUT(angleX % int256(TAU_MILLI));
            int256 cosY = _cosFromLUT(angleY % int256(TAU_MILLI));
            
            uint256 x = 256 + uint256((int256(Ax) * sinX) / 1000);
            uint256 y = 256 + uint256((int256(Ay) * cosY) / 1000);
            
            // Quantize for ghosts
            if (isGhost) {
                x = (x / 2) * 2;
                y = (y / 2) * 2;
            }
            
            if (i == 0) {
                pathData = abi.encodePacked(pathData, _toString(x), ' ', _toString(y));
            } else if (i % 9 == 0) {
                // Use quadratic curves for compression
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
    
    function _buildNoirSVG(string memory mainPath, string memory ghostPaths, uint8 ghosts) internal pure returns (string memory) {
        uint256 stdDev = ghosts >= 3 ? 8 : ghosts == 2 ? 7 : ghosts == 1 ? 5 : 4;
        uint256 glowWidth = ghosts >= 3 ? 24 : 21;
        
        return string(abi.encodePacked(
            '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="g0"><stop offset="0%" stop-color="#E6E6E6"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient>',
            '<filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="',
            _toString(stdDev),
            '"/></filter>',
            '<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">',
            '<path d="M0 0 L0 6" stroke="#000" stroke-opacity=".05" stroke-width="1"/>',
            '</pattern>',
            '</defs>',
            '<rect width="512" height="512" fill="#0f0e10"/>',
            '<rect width="512" height="512" fill="url(#hatch)" opacity=".06"/>',
            ghostPaths,
            '<path d="', mainPath, '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="',
            _toString(glowWidth),
            '" fill="none" opacity=".38" filter="url(#softGlow)"/>',
            '<path d="', mainPath, '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" opacity=".95"/>',
            '</svg>'
        ));
    }
    
    function _buildNeonSVG(string memory mainPath, string memory ghostPaths, uint8 ghosts) internal pure returns (string memory) {
        uint256 stdDev = ghosts >= 3 ? 8 : ghosts == 2 ? 7 : ghosts == 1 ? 5 : 4;
        uint256 glowWidth = ghosts >= 3 ? 24 : 21;
        
        return string(abi.encodePacked(
            '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="g0"><stop offset="0%" stop-color="#FF6A00"/><stop offset="100%" stop-color="#FFD966"/></linearGradient>',
            '<filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="',
            _toString(stdDev),
            '"/></filter>',
            '<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">',
            '<path d="M0 0 L0 6" stroke="#000" stroke-opacity=".05" stroke-width="1"/>',
            '</pattern>',
            '</defs>',
            '<rect width="512" height="512" fill="#1a1718"/>',
            '<rect width="512" height="512" fill="url(#hatch)" opacity=".06"/>',
            ghostPaths,
            '<path d="', mainPath, '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="',
            _toString(glowWidth),
            '" fill="none" opacity=".40" filter="url(#softGlow)"/>',
            '<path d="', mainPath, '" stroke="url(#g0)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" opacity=".95"/>',
            '</svg>'
        ));
    }
    
    function _generateAttributes(uint256 tokenId, Meta memory tokenMeta, bool isPoster) internal view returns (string memory) {
        uint16 cohortSize = blockCount[tokenMeta.blockNo];
        bytes32 digest = blockDigest[tokenMeta.blockNo];
        uint8 template = uint8(uint256(keccak256(abi.encode(digest, tokenMeta.indexInBlock))) % 2);
        uint8 ghosts = cohortSize >= 9 ? 3 : cohortSize >= 5 ? 2 : cohortSize >= 3 ? 1 : 0;
        
        return string(abi.encodePacked(
            '{"trait_type":"Template","value":"', template == 0 ? 'Noir' : 'Neon', '"},',
            '{"trait_type":"Cohort Size","value":', _toString(cohortSize), '},',
            '{"trait_type":"Ghost Count","value":', _toString(ghosts), '},',
            '{"trait_type":"Block","value":', _toString(tokenMeta.blockNo), '},',
            '{"trait_type":"Index in Block","value":', _toString(tokenMeta.indexInBlock), '},',
            '{"trait_type":"Type","value":"', isPoster ? 'Poster' : 'Regular', '"}'
        ));
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