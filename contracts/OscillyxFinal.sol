// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Oscillyx Final - Working Blockchain Physics NFTs  
 * @dev World's first NFT with rarity from blockchain physics
 */
contract OscillyxFinal is ERC721A, Ownable {
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

    function _getBlockchainRarity(uint256 tokenId) internal view returns (uint256) {
        Meta memory m = meta[tokenId];
        
        uint256 seedValue = uint256(bytes32(m.seed));
        uint256 hashEntropy = (seedValue % 100);
        uint256 temporalSig = (uint256(m.blockNo) % 100);
        uint256 positionUniq = (uint256(m.indexInBlock) % 100);
        
        uint256 total = (hashEntropy * 2) + temporalSig + positionUniq;
        
        if (total >= 400) return 5;
        if (total >= 350) return 4;
        if (total >= 300) return 3;
        if (total >= 200) return 2;
        if (total >= 100) return 1;
        return 0;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Not exist");
        
        uint256 rarity = _getBlockchainRarity(tokenId);
        Meta memory m = meta[tokenId];
        
        uint256 seed = uint256(bytes32(m.seed));
        uint256 hue1 = (seed % 360);
        uint256 hue2 = ((seed >> 8) % 360);
        
        string memory rarityName = _getRarityName(rarity);
        
        // Create simple, safe SVG without complex gradients or special chars
        string memory svg = string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="hsl(', _toString(hue1), ',50%,20%)"/>',
            '<circle cx="200" cy="200" r="', _toString(60 + (rarity * 20)), '" fill="none" stroke="hsl(', _toString(hue2), ',70%,60%)" stroke-width="', _toString(2 + rarity), '"/>',
            '<text x="200" y="350" text-anchor="middle" fill="white" font-family="monospace" font-size="16">', rarityName, '</text>',
            '</svg>'
        ));
        
        // Use base64 encoding to avoid any URI encoding issues
        string memory svgBase64 = _base64Encode(bytes(svg));
        
        string memory json = string(abi.encodePacked(
            '{',
            '"name":"Oscillyx #', _toString(tokenId), '",',
            '"description":"Blockchain Physics NFT - World First Cryptographic Rarity",',
            '"attributes":[',
            '{"trait_type":"Rarity","value":"', rarityName, '"},',
            '{"trait_type":"Block","value":"', _toString(m.blockNo), '"},',
            '{"trait_type":"Entropy","value":"', _toString(seed % 10000), '"}',
            '],',
            '"image":"data:image/svg+xml;base64,', svgBase64, '"',
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,", 
            _base64Encode(bytes(json))
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

    // Simple base64 encoding
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        uint256 encodedLen = 4 * ((len + 2) / 3);
        
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        for (i = 0; i < len; i += 3) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = i + 1 < len ? uint256(uint8(data[i + 1])) : 0;
            uint256 c = i + 2 < len ? uint256(uint8(data[i + 2])) : 0;
            
            uint256 bitmap = (a << 16) | (b << 8) | c;
            
            result[j++] = bytes1(uint8(bytes(table)[(bitmap >> 18) & 63]));
            result[j++] = bytes1(uint8(bytes(table)[(bitmap >> 12) & 63]));
            result[j++] = i + 1 < len ? bytes1(uint8(bytes(table)[(bitmap >> 6) & 63])) : bytes1("=");
            result[j++] = i + 2 < len ? bytes1(uint8(bytes(table)[bitmap & 63])) : bytes1("=");
        }
        
        return string(result);
    }

    function setMintingActive(bool active) external onlyOwner {
        mintingActive = active;
    }
}