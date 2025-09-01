// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./libs/Base64Simple.sol";
import "./libs/GeometryLib.sol";

/**
 * @title Oscillyx
 * @dev 100% on-chain generative NFT collection encoding block-level concurrency on Monad
 * Each token captures the cohort dynamics of its minting block, creating unique visual signatures
 */
contract Oscillyx is ERC721A, ERC2981, Ownable, Pausable, EIP712 {
    using ECDSA for bytes32;
    using GeometryLib for bytes32;

    // ============ CONSTANTS ============
    
    bytes32 public constant MINT_AUTH_TYPEHASH = keccak256(
        "MINT_AUTH(address to,uint256 deadline,uint8 sourceId,uint64 nonce)"
    );

    uint256 public immutable MAX_SUPPLY;
    string private _contractURI;
    
    // ============ CORE STORAGE ============
    
    struct Meta {
        uint32 blockNo;        // Block number when minted
        uint16 indexInBlock;   // Position within block's cohort  
        bytes16 seed;          // Deterministic randomness seed
        uint8 sourceId;        // Distribution channel (0=Twitter, 1=Discord, etc.)
        address referrer;      // Referral attribution
    }
    
    // Token metadata
    mapping(uint256 => Meta) public meta;
    
    // Block cohort tracking
    mapping(uint32 => uint16) public blockCount;    // Number of mints per block
    mapping(uint32 => bytes32) public blockDigest;  // Cohort entropy accumulator
    
    // Poster system (1/1 per block)
    mapping(uint32 => bool) public posterMinted;
    mapping(uint32 => uint256) public posterTokenId;
    
    // ============ EIP-712 SIGNATURE SYSTEM ============
    
    address public authorizedSigner;                 // Authorized signature issuer
    mapping(address => uint64) public nonces;       // Replay protection
    mapping(bytes32 => bool) public usedSignatures; // Additional replay protection
    
    // ============ MINTING CONTROLS ============
    
    bool public mintingActive = false;
    uint256 public maxPerTx = 5;
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
        ERC721A("Oscillyx", "OSC") 
        EIP712("Oscillyx", "1")
    {
        MAX_SUPPLY = maxSupply_;
        authorizedSigner = signer_;
        _contractURI = contractURI_;
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    // ============ SIGNATURE-GATED MINTING ============
    
    /**
     * @dev Mint tokens with EIP-712 signature verification (Twitter growth mechanic)
     * @param signature EIP-712 signature from authorized signer
     * @param referrer Address that referred this mint (on-chain attribution)
     * @param sourceId Distribution channel: 0=Twitter, 1=Discord, 2=Telegram, 3=Layer3, 4=Galxe
     * @param qty Number of tokens to mint
     * @param deadline Signature expiry timestamp
     */
    function mint(
        bytes calldata signature,
        address referrer,
        uint8 sourceId,
        uint256 qty,
        uint256 deadline
    ) external payable whenNotPaused {
        require(mintingActive, "Minting not active");
        require(qty > 0 && qty <= maxPerTx, "Invalid quantity");
        require(block.timestamp <= deadline, "Signature expired");
        require(_totalMinted() + qty <= MAX_SUPPLY, "Exceeds max supply");
        
        // Verify EIP-712 signature
        uint64 nonce = nonces[msg.sender]++;
        bytes32 structHash = keccak256(abi.encode(
            MINT_AUTH_TYPEHASH,
            msg.sender,
            deadline,
            sourceId,
            nonce
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        require(!usedSignatures[hash], "Signature already used");
        usedSignatures[hash] = true;
        
        address recovered = hash.recover(signature);
        require(recovered == authorizedSigner, "Invalid signature");
        
        // Mint tokens with cohort tracking
        _mintWithCohortTracking(msg.sender, qty, sourceId, referrer);
    }
    
    /**
     * @dev Owner mint for airdrops and testing
     */
    function ownerMint(address to, uint256 qty, uint8 sourceId) external onlyOwner whenNotPaused {
        require(_totalMinted() + qty <= MAX_SUPPLY, "Exceeds max supply");
        _mintWithCohortTracking(to, qty, sourceId, address(0));
    }

    // ============ COHORT TRACKING ============
    
    /**
     * @dev Internal mint function with block cohort tracking
     */
    function _mintWithCohortTracking(
        address to,
        uint256 qty, 
        uint8 sourceId,
        address referrer
    ) internal {
        uint32 currentBlock = uint32(block.number);
        uint256 startTokenId = _nextTokenId();
        
        for (uint256 i = 0; i < qty; i++) {
            uint256 tokenId = startTokenId + i;
            uint16 indexInBlock = blockCount[currentBlock]++;
            
            // Generate deterministic seed
            bytes16 seed = bytes16(keccak256(abi.encodePacked(
                to,
                tokenId,
                block.prevrandao,
                block.timestamp
            )));
            
            // Update cohort digest (accumulates block's minting entropy)
            blockDigest[currentBlock] = keccak256(abi.encode(
                blockDigest[currentBlock],
                seed,
                to,
                indexInBlock
            ));
            
            // Store token metadata
            meta[tokenId] = Meta({
                blockNo: currentBlock,
                indexInBlock: indexInBlock,
                seed: seed,
                sourceId: sourceId,
                referrer: referrer
            });
            
            emit Minted(to, tokenId, currentBlock, indexInBlock, sourceId, referrer);
        }
        
        emit CohortUpdated(currentBlock, blockCount[currentBlock], blockDigest[currentBlock]);
        
        // Execute the actual mint
        _safeMint(to, qty);
    }

    // ============ POSTER SYSTEM (1/1 PER BLOCK) ============
    
    /**
     * @dev Mint a unique poster representing the full cohort of a completed block
     * @param blockNo Block number to create poster for
     */
    function mintPoster(uint32 blockNo) external {
        require(block.number > blockNo, "Block not finalized");
        require(!posterMinted[blockNo], "Poster already minted");
        require(blockCount[blockNo] > 0, "No mints in block");
        
        posterMinted[blockNo] = true;
        uint256 tokenId = _nextTokenId();
        posterTokenId[blockNo] = tokenId;
        
        // Store special poster metadata
        meta[tokenId] = Meta({
            blockNo: blockNo,
            indexInBlock: type(uint16).max, // Special marker for posters
            seed: bytes16(blockDigest[blockNo]), // Use digest as seed
            sourceId: type(uint8).max, // Special marker for posters
            referrer: msg.sender // Poster creator gets attribution
        });
        
        _safeMint(msg.sender, 1);
        
        emit PosterMinted(blockNo, tokenId, blockCount[blockNo]);
    }

    // ============ ON-CHAIN METADATA & RENDERING ============
    
    /**
     * @dev Generate complete token URI with embedded SVG art and JSON metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        Meta memory tokenMeta = meta[tokenId];
        bool isPoster = tokenMeta.indexInBlock == type(uint16).max;
        
        // Generate SVG art
        string memory svg = isPoster ? 
            _generatePosterSVG(tokenMeta) : 
            _generateTokenSVG(tokenMeta);
        
        // Build JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Oscillyx ',
            isPoster ? 'Poster #' : '#',
            _toString(tokenId),
            '","description":"',
            _getDescription(isPoster),
            '","image":"data:image/svg+xml;base64,',
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
    
    /**
     * @dev Generate SVG art for regular tokens
     */
    function _generateTokenSVG(Meta memory tokenMeta) internal view returns (string memory) {
        // Step 1: Get cohort data 
        uint16 cohortSize = blockCount[tokenMeta.blockNo];
        uint8 densityTier = _getDensityTier(cohortSize);
        
        // Step 2: Determine style pack from block digest + index
        bytes32 styleRoot = keccak256(abi.encode(blockDigest[tokenMeta.blockNo], tokenMeta.indexInBlock));
        uint8 stylePackId = uint8(uint256(styleRoot) % 3);
        
        // Step 3: Generate main Oscillyx Lissajous curve
        string memory mainPath = _generateOscillyxArt(tokenMeta);
        
        // Step 4: Assemble clean single-path Oscillyx SVG
        return string(abi.encodePacked(
            '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">',
            _generateOscillyxDefs(stylePackId, densityTier),
            _generateOscillyxBackground(stylePackId),
            '<path d="', mainPath, '" class="main" stroke="url(#g0)" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.9" filter="url(#outerGlow)"/>',
            '<path d="', mainPath, '" class="inner" stroke="url(#g0)" stroke-width="4" stroke-linecap="round" fill="none" opacity="1" filter="url(#glow)"/>',
            '</svg>'
        ));
    }
    
    /**
     * @dev Generate SVG art for poster tokens (represents entire block cohort)
     */
    function _generatePosterSVG(Meta memory posterMeta) internal view returns (string memory) {
        uint16 cohortSize = blockCount[posterMeta.blockNo];
        bytes32 digest = blockDigest[posterMeta.blockNo];
        
        // Create complex composition representing the full cohort
        string memory composition = _generateCohortComposition(digest, cohortSize);
        
        return string(abi.encodePacked(
            '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
            _generateDefs(2, 5, keccak256(abi.encode(posterMeta.blockNo))), // Use Noir style for posters
            '<rect width="100%" height="100%" fill="#0a0a0a"/>',
            composition,
            _generateCohortStats(posterMeta.blockNo, cohortSize),
            '</svg>'
        ));
    }
    
    /**
     * @dev Get density tier from cohort size
     */
    function _getDensityTier(uint16 cohortSize) internal pure returns (uint8) {
        if (cohortSize == 1) return 0; // Solo
        if (cohortSize == 2) return 1; // Pair  
        if (cohortSize == 3) return 2; // Trio
        if (cohortSize == 4) return 3; // Quartet
        if (cohortSize <= 8) return 4; // Octet
        return 5; // Surge
    }
    
    /**
     * @dev Generate ghost strands based on block digest and density (simplified)
     */
    function _generateGhostStrands(bytes32 digest, uint8 densityTier) internal pure returns (string memory) {
        if (densityTier < 2) return ""; // Solo/Pair have minimal background flow
        
        uint256 numGhosts = densityTier >= 4 ? 3 : (densityTier - 1);
        bytes memory strands = "";
        
        for (uint256 i = 0; i < numGhosts; i++) {
            bytes32 ghostSeed = keccak256(abi.encode(digest, i));
            
            // Generate subtle flowing background curves
            uint256 cp1x = 128 + ((uint256(ghostSeed) >> 8) % 256);
            uint256 cp1y = 128 + ((uint256(ghostSeed) >> 16) % 256);
            uint256 cp2x = 128 + ((uint256(ghostSeed) >> 24) % 256);
            uint256 cp2y = 128 + ((uint256(ghostSeed) >> 32) % 256);
            
            string memory ghostPath = string(abi.encodePacked(
                "M64 ", _toString(128 + (i * 64)),
                " Q", _toString(cp1x), " ", _toString(cp1y),
                " ", _toString(cp2x), " ", _toString(cp2y),
                " Q", _toString(384 + (i * 16)), " ", _toString(256 - (i * 32)),
                " 448 ", _toString(384 - (i * 64))
            ));
            
            strands = abi.encodePacked(
                strands,
                '<path d="', ghostPath, '" ',
                'stroke="url(#g0)" stroke-opacity="0.', _toString(20 - i * 5), '" ',
                'stroke-width="', _toString(6 - i), '" fill="none"/>'
            );
        }
        
        return string(strands);
    }
    
    // ============ STYLE SYSTEM ============
    
    /**
     * @dev Generate SVG definitions (gradients, filters, patterns)
     */
    function _generateDefs(uint8 stylePackId, uint8 densityTier, bytes32 seed) internal pure returns (string memory) {
        string memory gradient = _getGradient(stylePackId);
        
        // Add background gradients for variety (like landing page)
        string memory bgGradient = '';
        uint256 bgType = (uint256(seed) >> 8) % 3;
        if (bgType == 1) {
            if (stylePackId == 0) { // Neon Flux bg gradients
                bgGradient = '<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#000033"/><stop offset="100%" stop-color="#001122"/></linearGradient>';
            } else if (stylePackId == 1) { // Ukiyo-e bg gradients
                bgGradient = '<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2a1810"/><stop offset="100%" stop-color="#4a3830"/></linearGradient>';
            }
        }
        
        // Always include glow filter for neon effect matching landing page
        string memory filter = '<filter id="glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
        
        return string(abi.encodePacked('<defs>', gradient, bgGradient, filter, '</defs>'));
    }
    
    /**
     * @dev Get style pack gradient
     */
    function _getGradient(uint8 stylePackId) internal pure returns (string memory) {
        if (stylePackId == 0) { // Neon Flux
            return '<linearGradient id="g0"><stop offset="0%" stop-color="#FF00FF"/><stop offset="100%" stop-color="#00FFFF"/></linearGradient>';
        } else if (stylePackId == 1) { // Ukiyo-e
            return '<linearGradient id="g0"><stop offset="0%" stop-color="#FF6A00"/><stop offset="100%" stop-color="#FFD966"/></linearGradient>';
        } else { // Noir Minimal
            return '<linearGradient id="g0"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#CCCCCC"/></linearGradient>';
        }
    }
    
    /**
     * @dev Generate randomized backgrounds like landing page
     */
    function _generateBackground(uint8 stylePackId, bytes32 seed) internal pure returns (string memory) {
        uint256 bgType = uint256(seed) % 4;
        
        if (stylePackId == 0) { // Neon Flux - varied backgrounds
            if (bgType == 0) return '<rect width="100%" height="100%" fill="#000011"/>'; // Dark
            if (bgType == 1) return '<rect width="100%" height="100%" fill="url(#bgGrad)"/>'; // Gradient
            if (bgType == 2) return '<rect width="100%" height="100%" fill="#001122"/>'; // Dark blue
            return '<rect width="100%" height="100%" fill="#110022"/>'; // Dark purple
        } else if (stylePackId == 1) { // Ukiyo-e - warm backgrounds  
            if (bgType == 0) return '<rect width="100%" height="100%" fill="#2a1810"/>'; // Warm dark
            if (bgType == 1) return '<rect width="100%" height="100%" fill="#3a2820"/>'; // Brown
            return '<rect width="100%" height="100%" fill="#4a3830"/>'; // Lighter brown
        } else { // Noir Minimal - monochrome
            if (bgType == 0) return '<rect width="100%" height="100%" fill="#000000"/>'; // Pure black
            return '<rect width="100%" height="100%" fill="#111111"/>'; // Dark grey
        }
    }
    
    /**
     * @dev Get main strand styling
     */
    function _getMainStrandStyle(uint8 stylePackId, uint8 densityTier) internal pure returns (string memory) {
        // Landing page algorithm: vary stroke width and effects by density tier
        string memory strokeWidth = _toString(densityTier >= 4 ? 4 : (densityTier >= 2 ? 3 : 2));
        string memory filter = densityTier >= 3 ? ' filter="url(#glow)"' : '';
        
        // Different opacity by style pack for variety
        string memory opacity = '';
        if (stylePackId == 1) { // Ukiyo-e - more opaque
            opacity = ' stroke-opacity="0.9"';
        } else if (stylePackId == 2) { // Noir - subtle
            opacity = ' stroke-opacity="0.7"';
        }
        
        return string(abi.encodePacked(
            'stroke="url(#g0)" stroke-width="', strokeWidth, '" fill="none"', opacity, filter
        ));
    }

    // ============ TRAIT GENERATION ============
    
    /**
     * @dev Generate JSON attributes for token
     */
    function _generateAttributes(
        uint256 tokenId,
        Meta memory tokenMeta, 
        bool isPoster
    ) internal view returns (string memory) {
        if (isPoster) {
            return _generatePosterAttributes(tokenMeta);
        }
        
        uint16 cohortSize = blockCount[tokenMeta.blockNo];
        uint8 densityTier = _getDensityTier(cohortSize);
        bytes32 artSeed = keccak256(abi.encode(tokenMeta.seed, tokenMeta.indexInBlock));
        
        // Extract curve parameters from seed
        uint256 fx = 2 + ((uint256(artSeed) >> 16) % 6);
        uint256 fy = 3 + ((uint256(artSeed) >> 24) % 6);
        uint256 phx = (uint256(artSeed) >> 32) % 256;
        uint256 phy = (uint256(artSeed) >> 40) % 256;
        
        // Calculate derived traits
        uint256 crossings = GeometryLib.calculateCrossings(fx, fy);
        uint256 symmetry = GeometryLib.detectSymmetry(phx, phy);
        // Use same style calculation as SVG generation for consistency
        bytes32 styleRoot = keccak256(abi.encode(blockDigest[tokenMeta.blockNo], tokenMeta.indexInBlock));
        uint8 stylePackId = uint8(uint256(styleRoot) % 3);
        uint256 energyScore = _calculateEnergyScore(fx, fy, crossings, densityTier);
        
        // Monad-specific traits from blockchain data
        uint256 executionIntensity = (uint256(blockDigest[tokenMeta.blockNo]) % 100) + 1;
        uint256 concurrencyLevel = cohortSize > 0 ? cohortSize : 1;
        uint256 throughputFactor = (uint256(artSeed) % 50) + 25;
        
        string memory basicTraits = string(abi.encodePacked(
            '{"trait_type":"Block","value":', _toString(tokenMeta.blockNo), '},',
            '{"trait_type":"IndexInBlock","value":', _toString(tokenMeta.indexInBlock), '},',
            '{"trait_type":"CohortSize","value":', _toString(cohortSize), '},',
            '{"trait_type":"DensityTier","value":"', _getDensityTierName(densityTier), '"},',
            '{"trait_type":"StylePack","value":"', _getStylePackName(stylePackId), '"}'
        ));
        
        string memory artTraits = string(abi.encodePacked(
            '{"trait_type":"FrequencyPair","value":"', _toString(fx), 'x', _toString(fy), '"},',
            '{"trait_type":"Crossings","value":', _toString(crossings), '},',
            '{"trait_type":"Symmetry","value":"', _getSymmetryName(symmetry), '"},',
            '{"trait_type":"EnergyScore","value":', _toString(energyScore), '}'
        ));
        
        string memory monadTraits = string(abi.encodePacked(
            '{"trait_type":"ExecutionIntensity","value":', _toString(executionIntensity), '},',
            '{"trait_type":"ConcurrencyLevel","value":', _toString(concurrencyLevel), '},',
            '{"trait_type":"ThroughputFactor","value":', _toString(throughputFactor), '},',
            '{"trait_type":"SourceId","value":"', _getSourceName(tokenMeta.sourceId), '"}'
        ));
        
        string memory seedTraits = string(abi.encodePacked(
            '{"trait_type":"SeedShort","value":"', _toHexString(uint256(bytes32(tokenMeta.seed)) >> 128, 8), '"},',
            '{"trait_type":"CohortDigestShort","value":"', _toHexString(uint256(blockDigest[tokenMeta.blockNo]) >> 224, 8), '"}'
        ));
        
        return string(abi.encodePacked(basicTraits, ',', artTraits, ',', monadTraits, ',', seedTraits));
    }

    // ============ UTILITY FUNCTIONS ============
    
    function _calculateEnergyScore(uint256 fx, uint256 fy, uint256 crossings, uint8 densityTier) 
        internal pure returns (uint256) 
    {
        return ((fx + fy) * 5 + crossings * 3 + densityTier * 10) % 101;
    }
    
    function _getDensityTierName(uint8 tier) internal pure returns (string memory) {
        if (tier == 0) return "Solo";
        if (tier == 1) return "Pair";
        if (tier == 2) return "Trio";
        if (tier == 3) return "Quartet";
        if (tier == 4) return "Octet";
        if (tier == 5) return "Surge";
        return "Unknown";
    }
    
    function _getStylePackName(uint8 styleId) internal pure returns (string memory) {
        if (styleId == 0) return "Neon Flux";
        if (styleId == 1) return "Ukiyo-e";
        if (styleId == 2) return "Noir Minimal";
        return "Unknown";
    }
    
    function _getSymmetryName(uint256 symmetry) internal pure returns (string memory) {
        if (symmetry == 0) return "None";
        if (symmetry == 1) return "Mirror";
        if (symmetry == 2) return "Radial";
        return "Unknown";
    }
    
    function _getSourceName(uint8 sourceId) internal pure returns (string memory) {
        if (sourceId == type(uint8).max) return "Poster";
        if (sourceId == 0) return "Twitter";
        if (sourceId == 1) return "Discord";
        if (sourceId == 2) return "Telegram";
        if (sourceId == 3) return "Layer3";
        if (sourceId == 4) return "Galxe";
        return "Unknown";
    }
    
    function _getDescription(bool isPoster) internal pure returns (string memory) {
        return isPoster ? 
            "Unique 1/1 poster representing the complete cohort dynamics of a minting block." :
            "Fully on-chain generative art encoding block-level concurrency dynamics on Monad.";
    }
    
    // ============ TRUE OSCILLYX RENDERER ============
    
    /**
     * @dev Deterministic PRNG for Oscillyx (from your spec)
     */
    function _mix(bytes32 s) internal pure returns (bytes32) {
        uint256 x = uint256(s);
        x ^= (x << 13); 
        x ^= (x >> 7); 
        x ^= (x << 17);
        return bytes32(x);
    }
    
    function _u(bytes32 s, uint256 mod, uint256 add) internal pure returns (uint256 r, bytes32 n) {
        n = _mix(s); 
        r = (uint256(n) % mod) + add; // [add .. add+mod-1]
    }
    
    /**
     * @dev Generate true Oscillyx art with Lissajous curves
     */
    function _generateOscillyxArt(Meta memory m) internal view returns (string memory) {
        // Step 1: Build deterministic root from mint-time state
        bytes32 root = keccak256(abi.encode(m.seed, m.indexInBlock, blockDigest[m.blockNo]));
        
        // Step 2: Derive Lissajous parameters from root
        (uint256 Ax, bytes32 r1) = _u(root, 200, 80);        // amplitude X: 80-280
        (uint256 Ay, bytes32 r2) = _u(r1, 200, 80);          // amplitude Y: 80-280
        (uint256 fx, bytes32 r3) = _u(r2, 6, 2);             // frequency X: 2-7
        (uint256 fy, bytes32 r4) = _u(r3, 6, 3);             // frequency Y: 3-8
        (uint256 phiX, bytes32 r5) = _u(r4, 628, 0);         // phase X: 0-628 (0-2π*100)
        (uint256 phiY, ) = _u(r5, 628, 0);                   // phase Y: 0-628 (0-2π*100)
        
        // Step 3: Index-in-block drives drama
        uint256 drama = 100 + (uint256(m.indexInBlock) * 20); // Higher index = more dramatic
        Ax = (Ax * drama) / 100;
        Ay = (Ay * drama) / 100;
        
        // Step 4: Generate Lissajous curve path
        return _generateLissajousPath(Ax, Ay, fx, fy, phiX, phiY);
    }
    
    /**
     * @dev Generate Lissajous curve as compact SVG path
     * Formula: x = 256 + Ax * sin(2π*fx*t + φx), y = 256 + Ay * cos(2π*fy*t + φy)
     */
    function _generateLissajousPath(
        uint256 Ax, uint256 Ay, 
        uint256 fx, uint256 fy, 
        uint256 phiX, uint256 phiY
    ) internal pure returns (string memory) {
        // Sample ~200 points (t = 0 to 200), convert to quadratic segments
        string memory path = "";
        
        // Start point (t=0)
        int256 sx0 = int256(Ax) * _sin(phiX) / 1000;
        int256 sy0 = int256(Ay) * _cos(phiY) / 1000;
        uint256 x0 = _safeCoordinate(256 + sx0);
        uint256 y0 = _safeCoordinate(256 + sy0);
        path = string(abi.encodePacked("M", _toString(x0), " ", _toString(y0)));
        
        // Generate quadratic segments (every 4 points)
        for (uint256 t = 4; t <= 200; t += 4) {
            // Calculate 3 points for smooth quadratic
            uint256 t1 = t - 2;
            uint256 t3 = t;
            
            // Point 1 (control)
            uint256 phase1X = phiX + (fx * t1 * 314) / 100; // 2π*fx*t1/100
            uint256 phase1Y = phiY + (fy * t1 * 314) / 100;
            int256 sx1 = int256(Ax) * _sin(phase1X) / 1000;
            int256 sy1 = int256(Ay) * _cos(phase1Y) / 1000;
            uint256 x1 = _safeCoordinate(256 + sx1);
            uint256 y1 = _safeCoordinate(256 + sy1);
            
            // Point 3 (end)
            uint256 phase3X = phiX + (fx * t3 * 314) / 100;
            uint256 phase3Y = phiY + (fy * t3 * 314) / 100;
            int256 sx3 = int256(Ax) * _sin(phase3X) / 1000;
            int256 sy3 = int256(Ay) * _cos(phase3Y) / 1000;
            uint256 x3 = _safeCoordinate(256 + sx3);
            uint256 y3 = _safeCoordinate(256 + sy3);
            
            // Add quadratic segment
            path = string(abi.encodePacked(
                path, " Q", _toString(x1), " ", _toString(y1), 
                " ", _toString(x3), " ", _toString(y3)
            ));
        }
        
        return path;
    }
    
    /**
     * @dev Approximate sine function (scaled by 1000)
     */
    function _sin(uint256 x) internal pure returns (int256) {
        x = x % 628; // 2π*100
        if (x <= 157) return int256((x * 1000) / 100); // Linear approx for first quadrant
        if (x <= 314) return int256(1000) - int256(((x - 157) * 1000) / 157);
        if (x <= 471) return -int256(((x - 314) * 1000) / 157);
        return -int256(1000) + int256(((x - 471) * 1000) / 157);
    }
    
    /**
     * @dev Approximate cosine function (scaled by 1000) 
     */
    function _cos(uint256 x) internal pure returns (int256) {
        return _sin(x + 157); // cos(x) = sin(x + π/2)
    }
    
    /**
     * @dev Convert int256 coordinate to safe uint256 within SVG bounds
     */
    function _safeCoordinate(int256 coord) internal pure returns (uint256) {
        if (coord < 0) return 0;
        if (coord > 512) return 512;
        return uint256(coord);
    }
    
    /**
     * @dev Generate ghost strands representing cohort members
     */
    function _generateOscillyxGhostStrands(uint32 blockNo, uint8 ghostCount) internal view returns (string memory) {
        if (ghostCount == 0) return ""; // Solo blocks have no ghosts
        
        string memory ghosts = "";
        bytes32 cohortDigest = blockDigest[blockNo];
        
        // Each ghost strand represents another token in the same block
        for (uint256 k = 0; k < ghostCount; k++) {
            bytes32 ghostSeed = keccak256(abi.encode(cohortDigest, k));
            
            // Generate smaller Lissajous curves for ghosts (reduced amplitudes)
            (uint256 gAx, bytes32 r1) = _u(ghostSeed, 100, 40);     // 40-140 (smaller than main)
            (uint256 gAy, bytes32 r2) = _u(r1, 100, 40);           // 40-140
            (uint256 gfx, bytes32 r3) = _u(r2, 4, 2);              // 2-5 (simpler frequencies)
            (uint256 gfy, bytes32 r4) = _u(r3, 4, 2);              // 2-5  
            (uint256 gphiX, bytes32 r5) = _u(r4, 628, 0);          // 0-628
            (uint256 gphiY, ) = _u(r5, 628, 0);                    // 0-628
            
            // Generate ghost path (simpler, fewer points)
            string memory ghostPath = _generateSimpleLissajous(gAx, gAy, gfx, gfy, gphiX, gphiY);
            
            ghosts = string(abi.encodePacked(
                ghosts,
                '<path d="', ghostPath, '" stroke="url(#g0)" stroke-opacity="0.15" stroke-width="1" fill="none"/>'
            ));
        }
        
        return ghosts;
    }
    
    /**
     * @dev Generate simplified Lissajous for ghost strands (fewer points for gas efficiency)
     */
    function _generateSimpleLissajous(
        uint256 Ax, uint256 Ay,
        uint256 fx, uint256 fy, 
        uint256 phiX, uint256 phiY
    ) internal pure returns (string memory) {
        // Start point
        int256 sx0 = int256(Ax) * _sin(phiX) / 1000;
        int256 sy0 = int256(Ay) * _cos(phiY) / 1000;
        uint256 x0 = _safeCoordinate(256 + sx0);
        uint256 y0 = _safeCoordinate(256 + sy0);
        string memory path = string(abi.encodePacked("M", _toString(x0), " ", _toString(y0)));
        
        // Generate fewer segments for ghosts (every 8 points)
        for (uint256 t = 8; t <= 100; t += 8) {
            uint256 phase_x = phiX + (fx * t * 314) / 100;
            uint256 phase_y = phiY + (fy * t * 314) / 100;
            int256 sx = int256(Ax) * _sin(phase_x) / 1000;
            int256 sy = int256(Ay) * _cos(phase_y) / 1000;
            uint256 x = _safeCoordinate(256 + sx);
            uint256 y = _safeCoordinate(256 + sy);
            
            path = string(abi.encodePacked(path, " L", _toString(x), " ", _toString(y)));
        }
        
        return path;
    }
    
    /**
     * @dev Generate Oscillyx style definitions
     */
    function _generateOscillyxDefs(uint8 stylePackId, uint8 densityTier) internal pure returns (string memory) {
        string memory gradient;
        
        if (stylePackId == 0) { // Neon Flux - Bright Cyan/Magenta
            gradient = '<linearGradient id="g0"><stop offset="0%" stop-color="#00FFFF"/><stop offset="100%" stop-color="#FF00FF"/></linearGradient>';
        } else if (stylePackId == 1) { // Ukiyo-e - Pink/Orange
            gradient = '<linearGradient id="g0"><stop offset="0%" stop-color="#FF1493"/><stop offset="100%" stop-color="#FF6B35"/></linearGradient>';
        } else { // Noir Minimal - Pure White
            gradient = '<linearGradient id="g0"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient>';
        }
        
        // Multiple glow effects for intense neon tube appearance
        string memory filters = string(abi.encodePacked(
            '<filter id="glow">',
            '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>',
            '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
            '</filter>',
            '<filter id="outerGlow">',
            '<feGaussianBlur stdDeviation="8" result="outerBlur"/>',
            '<feMerge><feMergeNode in="outerBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
            '</filter>'
        ));
        
        return string(abi.encodePacked('<defs>', gradient, filters, '</defs>'));
    }
    
    /**
     * @dev Generate Oscillyx background based on style pack
     */
    function _generateOscillyxBackground(uint8 stylePackId) internal pure returns (string memory) {
        if (stylePackId == 0) { // Neon Flux - Dark Purple/Teal
            return '<rect width="100%" height="100%" fill="#1a0d2e"/>';
        } else if (stylePackId == 1) { // Ukiyo-e - Dark Green
            return '<rect width="100%" height="100%" fill="#0d2818"/>';
        } else { // Noir Minimal - Dark Teal  
            return '<rect width="100%" height="100%" fill="#0a1a1a"/>';
        }
    }
    
    function _generateBackgroundPath(bytes32 seed) internal pure returns (string memory) {
        // Add subtle background paths for depth (like landing page)
        uint256 pathType = (uint256(seed) >> 16) % 3;
        
        if (pathType == 0) {
            return '<path d="M64 128 Q334 330 290 169 Q384 256 448 384" stroke="url(#g0)" stroke-opacity="0.20" stroke-width="6" fill="none"/>';
        } else if (pathType == 1) {
            return '<path d="M128 64 Q256 256 384 448 M128 448 Q256 256 384 64" stroke="url(#g0)" stroke-opacity="0.15" stroke-width="4" fill="none"/>';
        } else {
            return '<path d="M64 256 Q256 128 448 256 Q256 384 64 256" stroke="url(#g0)" stroke-opacity="0.25" stroke-width="3" fill="none"/>';
        }
    }
    
    function _generateFlowingCurves(bytes32 seed, uint256 intensity, uint256 concurrency, uint256 throughput, uint8 densityTier) internal pure returns (string memory) {
        // Match landing page complexity based on density tier
        if (densityTier == 0) { // Solo - Single simple curve like landing page
            uint256 curve = (uint256(seed) % 300) + 100;
            return string(abi.encodePacked("M64 ", _toString(curve), " Q256 256 448 ", _toString(512 - curve)));
        }
        
        if (densityTier == 1) { // Pair - Two intersecting curves  
            return string(abi.encodePacked(
                "M128 128 Q256 384 384 384 M128 384 Q256 128 384 128"
            ));
        }
        
        if (densityTier == 2) { // Trio - Three flowing curves
            return string(abi.encodePacked(
                "M256 256 Q117 225 334 361 Q237 189 256 256 ",
                "Q234 280 157 250 Q369 316 256 256 ",
                "M240 286 Q256 256 72 26 Q376 330 142 152"
            ));
        }
        
        if (densityTier == 3) { // Quartet - Complex intersections
            return string(abi.encodePacked(
                "M256 256 Q117 225 334 361 Q237 189 256 256 ",
                "M128 128 Q384 384 M384 128 Q128 384 ",
                "M64 256 Q256 64 448 256 Q256 448 64 256 ",
                "M256 100 Q400 256 256 412 Q112 256 256 100"
            ));
        }
        
        // Surge - Maximum complexity like landing page mythicals
        return string(abi.encodePacked(
            "M256 256 Q117 225 334 361 Q237 189 256 256 ",
            "M128 128 L384 384 M384 128 L128 384 ",
            "M64 256 Q256 64 448 256 Q256 448 64 256 ",
            "M256 100 Q400 256 256 412 Q112 256 256 100 ",
            "M150 150 Q256 256 362 362 M362 150 Q256 256 150 362"
        ));
    }
    
    function _generateWavePattern(bytes32 seed) internal pure returns (string memory) {
        uint256 freq1 = 3 + (uint256(seed) % 5); // Wave frequency 1
        uint256 freq2 = 4 + ((uint256(seed) >> 8) % 6); // Wave frequency 2
        uint256 amp = 30 + ((uint256(seed) >> 16) % 40); // Amplitude
        
        return string(abi.encodePacked(
            "M64 256 Q128 ", _toString(256 - amp), " 192 256",
            " Q256 ", _toString(256 + amp), " 320 256", 
            " Q384 ", _toString(256 - amp), " 448 256",
            " M256 64 Q", _toString(256 - amp), " 128 256 192",
            " Q", _toString(256 + amp), " 256 256 320",
            " Q", _toString(256 - amp), " 384 256 448"
        ));
    }
    
    function _generateIntersectionPattern(bytes32 seed) internal pure returns (string memory) {
        uint256 offset = 30 + (uint256(seed) % 50);
        uint256 curves = 3 + ((uint256(seed) >> 8) % 4);
        
        return string(abi.encodePacked(
            // Multiple intersecting curves
            "M128 128 Q256 ", _toString(256 - offset), " 384 128",
            " M128 384 Q256 ", _toString(256 + offset), " 384 384",  
            " M128 ", _toString(256 - offset), " Q256 128 ", _toString(256 + offset), " 256",
            " M128 ", _toString(256 + offset), " Q256 384 ", _toString(256 + offset), " 256"
        ));
    }
    
    function _generateSpiralPattern(bytes32 seed) internal pure returns (string memory) {
        uint256 spirals = 2 + (uint256(seed) % 3);
        uint256 radius = 60 + ((uint256(seed) >> 8) % 80);
        
        return string(abi.encodePacked(
            // Spiral from center outward
            "M256 256 Q", _toString(256 + radius/2), " ", _toString(256 - radius/2),
            " ", _toString(256 + radius), " 256",
            " Q", _toString(256 + radius/2), " ", _toString(256 + radius/2), 
            " 256 ", _toString(256 + radius),
            " Q", _toString(256 - radius/2), " ", _toString(256 + radius/2),
            " ", _toString(256 - radius), " 256"
        ));
    }
    
    function _generateCurveNetwork(bytes32 seed) internal pure returns (string memory) {
        uint256 nodes = 4 + (uint256(seed) % 4);
        uint256 x1 = 128 + ((uint256(seed) >> 8) % 256);
        uint256 y1 = 128 + ((uint256(seed) >> 16) % 256);
        uint256 x2 = 128 + ((uint256(seed) >> 24) % 256);
        uint256 y2 = 128 + ((uint256(seed) >> 32) % 256);
        
        return string(abi.encodePacked(
            // Complex network of connected curves
            "M64 64 Q", _toString(x1), " ", _toString(y1), " 256 256",
            " Q", _toString(x2), " ", _toString(y2), " 448 448",
            " M448 64 Q", _toString(384-x1%128), " ", _toString(y1), " 256 256",
            " Q", _toString(128+x2%128), " ", _toString(384-y2%128), " 64 448"
        ));
    }
    
    // Additional helper functions for poster rendering and cohort composition
    function _generateCohortComposition(bytes32 digest, uint16 cohortSize) internal pure returns (string memory) {
        // Simplified cohort visualization for posters
        return '<circle cx="256" cy="256" r="200" stroke="url(#g0)" stroke-width="8" fill="none"/>';
    }
    
    function _generateCohortStats(uint32 blockNo, uint16 cohortSize) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<text x="256" y="450" text-anchor="middle" fill="#ffffff" font-size="16">',
            'Block ', _toString(blockNo), ' - ', _toString(cohortSize), ' mints',
            '</text>'
        ));
    }
    
    function _generatePosterAttributes(Meta memory posterMeta) internal view returns (string memory) {
        uint16 cohortSize = blockCount[posterMeta.blockNo];
        return string(abi.encodePacked(
            '{"trait_type":"PosterForBlock","value":', _toString(posterMeta.blockNo), '},',
            '{"trait_type":"PosterCohortSize","value":', _toString(cohortSize), '},',
            '{"trait_type":"Type","value":"Poster"}'
        ));
    }
    
    function _toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        // Remove the require check that's causing issues
        return string(buffer);
    }
    
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    // ============ ADMIN FUNCTIONS ============
    
    function setSigner(address newSigner) external onlyOwner {
        authorizedSigner = newSigner;
    }
    
    function setMintingActive(bool active) external onlyOwner {
        mintingActive = active;
    }
    
    function setMaxPerTx(uint256 max) external onlyOwner {
        maxPerTx = max;
    }
    
    function setContractURI(string calldata uri) external onlyOwner {
        require(!metadataFrozen, "Metadata frozen");
        _contractURI = uri;
    }
    
    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // ============ VIEW FUNCTIONS ============
    
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
    
    function getCohortInfo(uint32 blockNo) external view returns (uint16 count, bytes32 digest) {
        return (blockCount[blockNo], blockDigest[blockNo]);
    }
    
    function getTokenMeta(uint256 tokenId) external view returns (Meta memory) {
        require(_exists(tokenId), "Token does not exist");
        return meta[tokenId];
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721A, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}