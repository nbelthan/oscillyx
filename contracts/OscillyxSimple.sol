// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./libs/Base64.sol";

/**
 * @title OscillyxSimple
 * @dev Simplified version for testing tokenURI generation
 */
contract OscillyxSimple is ERC721A, Ownable {
    
    uint256 public immutable MAX_SUPPLY;
    
    struct Meta {
        uint32 blockNo;
        uint16 indexInBlock;
        bytes16 seed;
        uint8 sourceId;
    }
    
    mapping(uint256 => Meta) public meta;
    mapping(uint32 => uint16) public blockCount;
    
    constructor(uint256 maxSupply_) ERC721A("OscillyxSimple", "OSCS") {
        MAX_SUPPLY = maxSupply_;
    }
    
    function mint(address to, uint256 qty) external onlyOwner {
        require(_totalMinted() + qty <= MAX_SUPPLY, "Exceeds max supply");
        
        uint32 currentBlock = uint32(block.number);
        uint256 startTokenId = _nextTokenId();
        
        for (uint256 i = 0; i < qty; i++) {
            uint256 tokenId = startTokenId + i;
            uint16 indexInBlock = blockCount[currentBlock]++;
            
            bytes16 seed = bytes16(keccak256(abi.encodePacked(
                to,
                tokenId,
                block.prevrandao
            )));
            
            meta[tokenId] = Meta({
                blockNo: currentBlock,
                indexInBlock: indexInBlock,
                seed: seed,
                sourceId: 0
            });
        }
        
        _safeMint(to, qty);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        Meta memory tokenMeta = meta[tokenId];
        
        // Simple SVG
        string memory svg = string(abi.encodePacked(
            '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
            '<circle cx="50" cy="50" r="40" fill="blue"/>',
            '<text x="50" y="50" text-anchor="middle" fill="white">', _toString(tokenId), '</text>',
            '</svg>'
        ));
        
        // Simple JSON
        string memory json = string(abi.encodePacked(
            '{"name":"Simple #', _toString(tokenId), '",',
            '"description":"Simple test token",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}