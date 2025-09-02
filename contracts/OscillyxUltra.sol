// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Oscillyx Ultra - Ultra-Safe Blockchain Physics NFTs
 * @dev World's first NFT with rarity from blockchain physics - Ultra gas optimized
 */
contract OscillyxUltra is ERC721A, Ownable {
    uint256 public immutable MAX_SUPPLY;
    
    struct Meta {
        uint32 blockNo;
        uint16 indexInBlock;
        bytes16 seed;
    }
    
    mapping(uint256 => Meta) public meta;
    mapping(uint32 => uint16) public blockCount;
    
    bool public mintingActive = false;

    constructor(uint256 maxSupply_) ERC721A("Oscillyx", "OSC") {
        MAX_SUPPLY = maxSupply_;
    }

    function ownerMint(address to, uint256 qty) external onlyOwner {
        require(_totalMinted() + qty <= MAX_SUPPLY, "Max supply");
        _mintWithTracking(to, qty);
    }

    function _mintWithTracking(address to, uint256 qty) internal {
        uint32 currentBlock = uint32(block.number);
        uint16 currentIndex = blockCount[currentBlock];
        
        uint256 startTokenId = _nextTokenId();
        
        for (uint256 i = 0; i < qty; i++) {
            uint256 tokenId = startTokenId + i;
            
            // Generate simple deterministic seed
            bytes16 seed = bytes16(
                keccak256(abi.encodePacked(currentBlock, currentIndex + i, block.timestamp))
            );
            
            meta[tokenId] = Meta({
                blockNo: currentBlock,
                indexInBlock: currentIndex + uint16(i),
                seed: seed
            });
        }
        
        blockCount[currentBlock] = currentIndex + uint16(qty);
        _mint(to, qty);
    }

    /**
     * @dev Ultra-safe blockchain physics rarity (0-5)
     */
    function _getBlockchainRarity(uint256 tokenId) internal view returns (uint256) {
        Meta memory m = meta[tokenId];
        
        // Extract safe values from seed
        uint256 seedValue = uint256(bytes32(m.seed));
        
        // Simple, safe calculations
        uint256 hashEntropy = (seedValue % 100);
        uint256 temporalSig = (uint256(m.blockNo) % 100);
        uint256 positionUniq = (uint256(m.indexInBlock) % 100);
        
        // Weighted total (max 500)
        uint256 total = (hashEntropy * 2) + temporalSig + positionUniq;
        
        // Safe tier assignment
        if (total >= 400) return 5; // Network Apex
        if (total >= 350) return 4; // Genesis Hash
        if (total >= 300) return 3; // Chain Resonance
        if (total >= 200) return 2; // Digital Moment
        if (total >= 100) return 1; // Block Echo
        return 0; // Network Pulse
    }

    /**
     * @dev Generate ultra-simple, safe SVG
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Not exist");
        
        uint256 rarity = _getBlockchainRarity(tokenId);
        Meta memory m = meta[tokenId];
        
        // Extract safe color values
        uint256 seed = uint256(bytes32(m.seed));
        uint256 hue1 = (seed % 360);
        uint256 hue2 = ((seed >> 8) % 360);
        
        // Generate ultra-simple art
        string memory art = _generateSimpleArt(rarity, hue1, hue2);
        string memory rarityName = _getRarityName(rarity);
        
        // Build minimal JSON
        string memory json = string(abi.encodePacked(
            '{"name":"Oscillyx #', _toString(tokenId), '",',
            '"description":"Blockchain Physics NFT",',
            '"attributes":[{"trait_type":"Rarity","value":"', rarityName, '"},',
            '{"trait_type":"Block","value":"', _toString(m.blockNo), '"}],',
            '"image":"data:image/svg+xml;utf8,', art, '"}'
        ));
        
        return string(abi.encodePacked("data:application/json;utf8,", json));
    }

    function _generateSimpleArt(uint256 rarity, uint256 h1, uint256 h2) internal pure returns (string memory) {
        if (rarity >= 5) return _genApex(h1, h2);
        if (rarity >= 4) return _genGenesis(h1, h2);
        if (rarity >= 3) return _genResonance(h1, h2);
        if (rarity >= 2) return _genMoment(h1, h2);
        if (rarity >= 1) return _genEcho(h1, h2);
        return _genPulse(h1, h2);
    }

    function _genPulse(uint256 h1, uint256 h2) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(h1), ',50%,20%)"/>',
            '<circle cx="200" cy="200" r="100" fill="none" stroke="hsl(', _toString(h2), ',70%,60%)" stroke-width="2"/>',
            '<circle cx="200" cy="200" r="150" fill="none" stroke="hsl(', _toString(h2), ',70%,40%)" stroke-width="1"/>',
            '</svg>'
        ));
    }

    function _genEcho(uint256 h1, uint256 h2) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(h1), ',60%,25%)"/>',
            '<path d="M50,200 Q200,100 350,200 Q200,300 50,200" fill="none" stroke="hsl(', _toString(h2), ',80%,70%)" stroke-width="3"/>',
            '<path d="M100,200 Q200,150 300,200 Q200,250 100,200" fill="none" stroke="white" stroke-width="2" opacity="0.7"/>',
            '</svg>'
        ));
    }

    function _genMoment(uint256 h1, uint256 h2) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(h1), ',70%,30%)"/>',
            '<polygon points="200,100 300,200 200,300 100,200" fill="none" stroke="hsl(', _toString(h2), ',90%,80%)" stroke-width="3"/>',
            '<polygon points="200,150 250,200 200,250 150,200" fill="hsl(', _toString(h2), ',90%,60%)" opacity="0.3"/>',
            '</svg>'
        ));
    }

    function _genResonance(uint256 h1, uint256 h2) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(h1), ',80%,25%)"/>',
            '<g transform="translate(200,200)">',
            '<circle r="80" fill="none" stroke="hsl(', _toString(h2), ',100%,70%)" stroke-width="2"/>',
            '<path d="M0,-100 L0,100 M-100,0 L100,0" stroke="gold" stroke-width="2"/>',
            '</g></svg>'
        ));
    }

    function _genGenesis(uint256 h1, uint256 h2) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(h1), ',90%,20%)"/>',
            '<g transform="translate(200,200)">',
            '<path d="M0,-80 A80,80 0 0,1 80,0 A80,80 0 0,1 0,80" fill="none" stroke="gold" stroke-width="4"/>',
            '<circle r="120" fill="none" stroke="hsl(', _toString(h2), ',100%,80%)" stroke-width="1"/>',
            '</g></svg>'
        ));
    }

    function _genApex(uint256 h1, uint256 h2) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(h1), ',100%,15%)"/>',
            '<g transform="translate(200,200)">',
            '<polygon points="0,-100 86,-50 86,50 0,100 -86,50 -86,-50" fill="none" stroke="gold" stroke-width="4"/>',
            '<polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="gold" opacity="0.2"/>',
            '<circle r="140" fill="none" stroke="hsl(', _toString(h2), ',100%,90%)" stroke-width="1" opacity="0.5"/>',
            '</g></svg>'
        ));
    }

    function _getRarityName(uint256 rarity) internal pure returns (string memory) {
        if (rarity >= 5) return "Network Apex";
        if (rarity >= 4) return "Genesis Hash";
        if (rarity >= 3) return "Chain Resonance";
        if (rarity >= 2) return "Digital Moment";
        if (rarity >= 1) return "Block Echo";
        return "Network Pulse";
    }

    function setMintingActive(bool active) external onlyOwner {
        mintingActive = active;
    }
}