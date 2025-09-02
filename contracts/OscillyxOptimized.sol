// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title Oscillyx - Optimized Blockchain Physics NFTs
 * @dev World's first NFT collection with rarity determined by actual blockchain physics
 * Gas-optimized with mathematical art generation
 */
contract OscillyxOptimized is ERC721A, Ownable, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant MINT_AUTH_TYPEHASH = keccak256(
        "MINT_AUTH(address to,uint256 deadline,uint8 sourceId,uint64 nonce)"
    );

    uint256 public immutable MAX_SUPPLY;
    
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
    
    address public authorizedSigner;
    mapping(address => uint64) public nonces;
    mapping(bytes32 => bool) public usedSignatures;
    
    bool public mintingActive = false;
    uint256 public maxPerTx = 5;

    event Minted(address indexed to, uint256 indexed tokenId, uint32 blockNo, uint8 sourceId);

    constructor(
        uint256 maxSupply_,
        address signer_
    ) ERC721A("Oscillyx", "OSC") EIP712("Oscillyx", "1") {
        MAX_SUPPLY = maxSupply_;
        authorizedSigner = signer_;
    }

    function mint(
        bytes calldata signature,
        address referrer,
        uint8 sourceId,
        uint256 qty,
        uint256 deadline
    ) external payable {
        require(mintingActive, "Not active");
        require(qty > 0 && qty <= maxPerTx, "Invalid qty");
        require(block.timestamp <= deadline, "Expired");
        require(_totalMinted() + qty <= MAX_SUPPLY, "Max supply");
        
        uint64 nonce = nonces[msg.sender]++;
        bytes32 structHash = keccak256(abi.encode(
            MINT_AUTH_TYPEHASH, msg.sender, deadline, sourceId, nonce
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        require(!usedSignatures[hash], "Used signature");
        usedSignatures[hash] = true;
        
        require(hash.recover(signature) == authorizedSigner, "Invalid sig");
        
        _mintWithTracking(msg.sender, qty, sourceId, referrer);
    }

    function ownerMint(address to, uint256 qty, uint8 sourceId) external onlyOwner {
        require(_totalMinted() + qty <= MAX_SUPPLY, "Max supply");
        _mintWithTracking(to, qty, sourceId, address(0));
    }

    function _mintWithTracking(address to, uint256 qty, uint8 sourceId, address referrer) internal {
        uint32 currentBlock = uint32(block.number);
        uint16 currentIndex = blockCount[currentBlock];
        
        // Update block digest with new mints
        bytes32 currentDigest = blockDigest[currentBlock];
        if (currentDigest == bytes32(0)) {
            currentDigest = blockhash(currentBlock - 1);
        }
        
        uint256 startTokenId = _nextTokenId();
        
        for (uint256 i = 0; i < qty; i++) {
            uint256 tokenId = startTokenId + i;
            
            // Generate deterministic seed
            bytes16 seed = bytes16(
                keccak256(abi.encodePacked(currentBlock, currentIndex + i, currentDigest))
            );
            
            meta[tokenId] = Meta({
                blockNo: currentBlock,
                indexInBlock: currentIndex + uint16(i),
                seed: seed,
                sourceId: sourceId,
                referrer: referrer
            });
            
            emit Minted(to, tokenId, currentBlock, sourceId);
        }
        
        // Update block tracking
        blockCount[currentBlock] = currentIndex + uint16(qty);
        blockDigest[currentBlock] = keccak256(abi.encodePacked(currentDigest, to, qty));
        
        _mint(to, qty);
    }

    /**
     * @dev Calculate blockchain physics rarity (0-5)
     */
    function _getBlockchainRarity(uint256 tokenId) internal view returns (uint8) {
        Meta memory m = meta[tokenId];
        
        // Hash entropy (40% weight)
        uint256 seedInt = uint256(bytes32(m.seed));
        uint8 hashScore = uint8((seedInt % 256) * 100 / 256);
        
        // Temporal significance (30% weight)
        uint8 timeScore = uint8(((m.blockNo % 1000) * 100) / 1000);
        
        // Position uniqueness (30% weight)
        uint8 posScore = uint8((m.indexInBlock * 100) / 10);
        if (posScore > 100) posScore = 100;
        
        uint256 total = (hashScore * 40) + (timeScore * 30) + (posScore * 30);
        
        if (total >= 8000) return 5; // Network Apex
        if (total >= 7000) return 4; // Genesis Hash
        if (total >= 6000) return 3; // Chain Resonance
        if (total >= 4000) return 2; // Digital Moment
        if (total >= 2000) return 1; // Block Echo
        return 0; // Network Pulse
    }

    /**
     * @dev Generate optimized mathematical art SVG
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Not exist");
        
        uint8 rarity = _getBlockchainRarity(tokenId);
        Meta memory m = meta[tokenId];
        
        // Extract values from seed for art generation
        uint256 seed = uint256(bytes32(m.seed));
        uint256 c1 = (seed >> 16) % 360; // Hue 1
        uint256 c2 = (seed >> 8) % 360;  // Hue 2
        uint256 pattern = seed % 8;      // Pattern variation
        
        string memory art = _generateArt(rarity, c1, c2, pattern);
        string memory rarityName = _getRarityName(rarity);
        
        // Simple base64 encoding for minimal gas
        bytes memory json = abi.encodePacked(
            '{"name":"Oscillyx #', _toString(tokenId),
            '","description":"Blockchain physics NFT - World\'s first cryptographic rarity",',
            '"attributes":[{"trait_type":"Rarity","value":"', rarityName, '"},',
            '{"trait_type":"Block","value":', _toString(m.blockNo), '},',
            '{"trait_type":"Entropy","value":', _toString((uint256(bytes32(m.seed)) % 10000)), '}],',
            '"image":"data:image/svg+xml;utf8,', art, '"}'
        );
        
        return string(abi.encodePacked(
            "data:application/json;utf8,", json
        ));
    }

    function _generateArt(uint256 rarity, uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        if (rarity == 5) return _generateApex(c1, c2, pattern);
        if (rarity == 4) return _generateGenesis(c1, c2, pattern);
        if (rarity == 3) return _generateResonance(c1, c2, pattern);
        if (rarity == 2) return _generateMoment(c1, c2, pattern);
        if (rarity == 1) return _generateEcho(c1, c2, pattern);
        return _generatePulse(c1, c2, pattern);
    }

    // Network Pulse - Concentric circles (blockchain rings)
    function _generatePulse(uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><radialGradient id="g"><stop offset="0%" stop-color="hsl(', _toString(c1), ',70%,60%)"/>',
            '<stop offset="100%" stop-color="hsl(', _toString(c2), ',70%,20%)"/></radialGradient></defs>',
            '<rect width="400" height="400" fill="url(%23g)"/>',
            '<circle cx="200" cy="200" r="', _toString(50 + pattern * 10), '" fill="none" stroke="white" stroke-width="2" opacity="0.8"/>',
            '<circle cx="200" cy="200" r="', _toString(80 + pattern * 15), '" fill="none" stroke="white" stroke-width="1" opacity="0.6"/>',
            '<circle cx="200" cy="200" r="', _toString(120 + pattern * 20), '" fill="none" stroke="white" stroke-width="1" opacity="0.4"/>',
            '</svg>'
        ));
    }

    // Block Echo - Geometric waves (data transmission)
    function _generateEcho(uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><linearGradient id="g"><stop offset="0%" stop-color="hsl(', _toString(c1), ',80%,50%)"/>',
            '<stop offset="100%" stop-color="hsl(', _toString(c2), ',80%,30%)"/></linearGradient></defs>',
            '<rect width="400" height="400" fill="url(%23g)"/>',
            '<path d="M50,200 Q200,', _toString(100 + pattern * 20), ' 350,200 Q200,', _toString(300 - pattern * 20), ' 50,200" fill="none" stroke="white" stroke-width="3" opacity="0.9"/>',
            '<path d="M75,200 Q200,', _toString(120 + pattern * 15), ' 325,200 Q200,', _toString(280 - pattern * 15), ' 75,200" fill="none" stroke="white" stroke-width="2" opacity="0.7"/>',
            '</svg>'
        ));
    }

    // Digital Moment - Crystalline structures 
    function _generateMoment(uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><radialGradient id="g"><stop offset="0%" stop-color="hsl(', _toString(c1), ',90%,70%)"/>',
            '<stop offset="100%" stop-color="hsl(', _toString(c2), ',90%,20%)"/></radialGradient></defs>',
            '<rect width="400" height="400" fill="url(%23g)"/>',
            '<polygon points="200,50 ', _toString(300 + pattern * 5), ',200 200,350 ', _toString(100 - pattern * 5), ',200" fill="none" stroke="white" stroke-width="2" opacity="0.8"/>',
            '<polygon points="200,100 ', _toString(250 + pattern * 3), ',200 200,300 ', _toString(150 - pattern * 3), ',200" fill="white" opacity="0.1"/>',
            '</svg>'
        ));
    }

    // Chain Resonance - Mandala patterns
    function _generateResonance(uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><radialGradient id="g"><stop offset="0%" stop-color="hsl(', _toString(c1), ',100%,60%)"/>',
            '<stop offset="100%" stop-color="hsl(', _toString(c2), ',100%,30%)"/></radialGradient></defs>',
            '<rect width="400" height="400" fill="url(%23g)"/>',
            '<g transform="translate(200,200)"><circle r="', _toString(60 + pattern * 5), '" fill="none" stroke="white" stroke-width="2"/>',
            '<circle r="', _toString(90 + pattern * 8), '" fill="none" stroke="white" stroke-width="1" opacity="0.7"/>',
            '<path d="M0,-80 L0,80 M-80,0 L80,0" stroke="white" stroke-width="2" opacity="0.8"/></g>',
            '</svg>'
        ));
    }

    // Genesis Hash - Fibonacci spirals
    function _generateGenesis(uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><radialGradient id="g"><stop offset="0%" stop-color="hsl(', _toString(c1), ',100%,80%)"/>',
            '<stop offset="100%" stop-color="hsl(', _toString(c2), ',100%,20%)"/></radialGradient></defs>',
            '<rect width="400" height="400" fill="url(%23g)"/>',
            '<g transform="translate(200,200)"><path d="M0,-70 A70,70 0 0,1 43,-56 A43,43 0 0,1 70,0 A70,70 0 0,1 0,70" fill="none" stroke="gold" stroke-width="3"/>',
            '<circle r="', _toString(100 + pattern * 10), '" fill="none" stroke="white" stroke-width="1" opacity="0.6"/></g>',
            '</svg>'
        ));
    }

    // Network Apex - Sacred geometry
    function _generateApex(uint256 c1, uint256 c2, uint256 pattern) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><radialGradient id="g"><stop offset="0%" stop-color="hsl(', _toString(c1), ',100%,90%)"/>',
            '<stop offset="100%" stop-color="hsl(', _toString(c2), ',100%,20%)"/></radialGradient></defs>',
            '<rect width="400" height="400" fill="url(%23g)"/>',
            '<g transform="translate(200,200)"><polygon points="0,-80 69,-40 69,40 0,80 -69,40 -69,-40" fill="none" stroke="gold" stroke-width="3"/>',
            '<polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="gold" opacity="0.1"/>',
            '<circle r="', _toString(120 + pattern * 15), '" fill="none" stroke="white" stroke-width="1" opacity="0.3"/></g>',
            '</svg>'
        ));
    }

    function _getRarityName(uint256 rarity) internal pure returns (string memory) {
        if (rarity == 5) return "Network Apex";
        if (rarity == 4) return "Genesis Hash"; 
        if (rarity == 3) return "Chain Resonance";
        if (rarity == 2) return "Digital Moment";
        if (rarity == 1) return "Block Echo";
        return "Network Pulse";
    }

    // Admin functions
    function setMintingActive(bool active) external onlyOwner {
        mintingActive = active;
    }

    function setAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigner = signer;
    }
}