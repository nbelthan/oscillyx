const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Oscillyx", function () {
  let oscillyx;
  let owner, signer, user1, user2;
  
  const MAX_SUPPLY = 10000;
  const ROYALTY_FEE = 500; // 5%
  const CONTRACT_URI = "https://example.com/contract";

  beforeEach(async function () {
    [owner, signer, user1, user2] = await ethers.getSigners();
    
    const Oscillyx = await ethers.getContractFactory("Oscillyx");
    oscillyx = await Oscillyx.deploy(
      MAX_SUPPLY,
      signer.address,
      owner.address,
      ROYALTY_FEE,
      CONTRACT_URI
    );
    await oscillyx.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct initial parameters", async function () {
      expect(await oscillyx.name()).to.equal("Oscillyx");
      expect(await oscillyx.symbol()).to.equal("BLKWV");
      expect(await oscillyx.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await oscillyx.signer()).to.equal(signer.address);
      expect(await oscillyx.owner()).to.equal(owner.address);
      expect(await oscillyx.contractURI()).to.equal(CONTRACT_URI);
    });

    it("Should start with minting disabled", async function () {
      expect(await oscillyx.mintingActive()).to.equal(false);
      expect(await oscillyx.totalSupply()).to.equal(0);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to enable minting", async function () {
      await oscillyx.setMintingActive(true);
      expect(await oscillyx.mintingActive()).to.equal(true);
    });

    it("Should allow owner to set new signer", async function () {
      await oscillyx.setSigner(user1.address);
      expect(await oscillyx.signer()).to.equal(user1.address);
    });

    it("Should not allow non-owner to set signer", async function () {
      await expect(
        oscillyx.connect(user1).setSigner(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Owner Minting", function () {
    beforeEach(async function () {
      await oscillyx.setMintingActive(true);
    });

    it("Should allow owner to mint tokens", async function () {
      const tx = await oscillyx.ownerMint(user1.address, 3, 0); // sourceId 0 = Twitter
      const receipt = await tx.wait();
      
      expect(await oscillyx.totalSupply()).to.equal(3);
      expect(await oscillyx.balanceOf(user1.address)).to.equal(3);
      
      // Check events
      const mintedEvents = receipt.events.filter(e => e.event === "Minted");
      expect(mintedEvents).to.have.length(3);
      
      // Verify cohort tracking
      const cohortInfo = await oscillyx.getCohortInfo(receipt.blockNumber);
      expect(cohortInfo.count).to.equal(3);
      expect(cohortInfo.digest).to.not.equal(ethers.constants.HashZero);
    });

    it("Should track token metadata correctly", async function () {
      const tx = await oscillyx.ownerMint(user1.address, 2, 1); // sourceId 1 = Discord
      const receipt = await tx.wait();
      
      // Check first token metadata
      const meta1 = await oscillyx.getTokenMeta(1);
      expect(meta1.blockNo).to.equal(receipt.blockNumber);
      expect(meta1.indexInBlock).to.equal(0);
      expect(meta1.sourceId).to.equal(1);
      expect(meta1.seed).to.not.equal(ethers.constants.HashZero);
      
      // Check second token metadata
      const meta2 = await oscillyx.getTokenMeta(2);
      expect(meta2.blockNo).to.equal(receipt.blockNumber);
      expect(meta2.indexInBlock).to.equal(1);
      expect(meta2.sourceId).to.equal(1);
      expect(meta2.seed).to.not.equal(meta1.seed); // Different seeds
    });

    it("Should enforce max supply", async function () {
      // Deploy with small max supply for testing
      const SmallOscillyx = await ethers.getContractFactory("Oscillyx");
      const smallContract = await SmallOscillyx.deploy(
        5, // Small max supply
        signer.address,
        owner.address,
        ROYALTY_FEE,
        CONTRACT_URI
      );
      await smallContract.deployed();
      await smallContract.setMintingActive(true);
      
      // Mint up to max supply
      await smallContract.ownerMint(user1.address, 5, 0);
      
      // Should fail to mint beyond max supply
      await expect(
        smallContract.ownerMint(user1.address, 1, 0)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("EIP-712 Signature Minting", function () {
    let domain;
    
    beforeEach(async function () {
      await oscillyx.setMintingActive(true);
      
      // Set up EIP-712 domain
      const network = await ethers.provider.getNetwork();
      domain = {
        name: "Oscillyx",
        version: "1",
        chainId: network.chainId,
        verifyingContract: oscillyx.address
      };
    });

    it("Should accept valid EIP-712 signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const nonce = 0;
      const sourceId = 0;
      
      // Create signature
      const types = {
        MINT_AUTH: [
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "sourceId", type: "uint8" },
          { name: "nonce", type: "uint64" }
        ]
      };
      
      const value = {
        to: user1.address,
        deadline: deadline,
        sourceId: sourceId,
        nonce: nonce
      };
      
      const signature = await signer._signTypedData(domain, types, value);
      
      // Mint with signature
      const tx = await oscillyx.connect(user1).mint(
        signature,
        user2.address, // referrer
        sourceId,
        1, // qty
        deadline
      );
      
      await tx.wait();
      
      expect(await oscillyx.totalSupply()).to.equal(1);
      expect(await oscillyx.balanceOf(user1.address)).to.equal(1);
      expect(await oscillyx.nonces(user1.address)).to.equal(1);
    });

    it("Should reject expired signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) - 1; // Expired
      const nonce = 0;
      const sourceId = 0;
      
      const types = {
        MINT_AUTH: [
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "sourceId", type: "uint8" },
          { name: "nonce", type: "uint64" }
        ]
      };
      
      const value = {
        to: user1.address,
        deadline: deadline,
        sourceId: sourceId,
        nonce: nonce
      };
      
      const signature = await signer._signTypedData(domain, types, value);
      
      await expect(
        oscillyx.connect(user1).mint(signature, user2.address, sourceId, 1, deadline)
      ).to.be.revertedWith("Signature expired");
    });

    it("Should reject signature from wrong signer", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const nonce = 0;
      const sourceId = 0;
      
      const types = {
        MINT_AUTH: [
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "sourceId", type: "uint8" },
          { name: "nonce", type: "uint64" }
        ]
      };
      
      const value = {
        to: user1.address,
        deadline: deadline,
        sourceId: sourceId,
        nonce: nonce
      };
      
      // Sign with wrong signer
      const signature = await user2._signTypedData(domain, types, value);
      
      await expect(
        oscillyx.connect(user1).mint(signature, user2.address, sourceId, 1, deadline)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should prevent signature replay", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const nonce = 0;
      const sourceId = 0;
      
      const types = {
        MINT_AUTH: [
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "sourceId", type: "uint8" },
          { name: "nonce", type: "uint64" }
        ]
      };
      
      const value = {
        to: user1.address,
        deadline: deadline,
        sourceId: sourceId,
        nonce: nonce
      };
      
      const signature = await signer._signTypedData(domain, types, value);
      
      // First mint should succeed
      await oscillyx.connect(user1).mint(signature, user2.address, sourceId, 1, deadline);
      
      // Second mint with same signature should fail
      await expect(
        oscillyx.connect(user1).mint(signature, user2.address, sourceId, 1, deadline)
      ).to.be.revertedWith("Signature already used");
    });
  });

  describe("Cohort Tracking", function () {
    beforeEach(async function () {
      await oscillyx.setMintingActive(true);
    });

    it("Should track cohort size correctly", async function () {
      const tx1 = await oscillyx.ownerMint(user1.address, 2, 0);
      const receipt1 = await tx1.wait();
      const block1 = receipt1.blockNumber;
      
      let cohortInfo = await oscillyx.getCohortInfo(block1);
      expect(cohortInfo.count).to.equal(2);
      
      // Mint more in same block (simulate by calling in same transaction context)
      await oscillyx.ownerMint(user2.address, 1, 1);
      
      // In new block, check previous block cohort stayed same
      cohortInfo = await oscillyx.getCohortInfo(block1);
      expect(cohortInfo.count).to.equal(2);
    });

    it("Should generate different cohort digests for different blocks", async function () {
      const tx1 = await oscillyx.ownerMint(user1.address, 1, 0);
      const receipt1 = await tx1.wait();
      
      const tx2 = await oscillyx.ownerMint(user1.address, 1, 0);
      const receipt2 = await tx2.wait();
      
      // If in different blocks
      if (receipt1.blockNumber !== receipt2.blockNumber) {
        const digest1 = await oscillyx.blockDigest(receipt1.blockNumber);
        const digest2 = await oscillyx.blockDigest(receipt2.blockNumber);
        expect(digest1).to.not.equal(digest2);
      }
    });
  });

  describe("Poster System", function () {
    beforeEach(async function () {
      await oscillyx.setMintingActive(true);
    });

    it("Should allow poster minting for completed blocks with mints", async function () {
      // Mint some tokens
      const mintTx = await oscillyx.ownerMint(user1.address, 3, 0);
      const mintReceipt = await mintTx.wait();
      const mintBlock = mintReceipt.blockNumber;
      
      // Mine a few more blocks to ensure the mint block is "completed"
      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");
      
      // Mint poster
      const posterTx = await oscillyx.connect(user1).mintPoster(mintBlock);
      await posterTx.wait();
      
      expect(await oscillyx.posterMinted(mintBlock)).to.equal(true);
      expect(await oscillyx.totalSupply()).to.equal(4); // 3 regular + 1 poster
    });

    it("Should reject poster minting for current block", async function () {
      const currentBlock = await ethers.provider.getBlockNumber();
      
      await expect(
        oscillyx.connect(user1).mintPoster(currentBlock)
      ).to.be.revertedWith("Block not finalized");
    });

    it("Should reject duplicate poster minting", async function () {
      // Mint some tokens
      const mintTx = await oscillyx.ownerMint(user1.address, 1, 0);
      const mintReceipt = await mintTx.wait();
      const mintBlock = mintReceipt.blockNumber;
      
      // Mine more blocks
      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");
      
      // First poster mint should succeed
      await oscillyx.connect(user1).mintPoster(mintBlock);
      
      // Second poster mint should fail
      await expect(
        oscillyx.connect(user2).mintPoster(mintBlock)
      ).to.be.revertedWith("Poster already minted");
    });
  });

  describe("Token URI Generation", function () {
    beforeEach(async function () {
      await oscillyx.setMintingActive(true);
      await oscillyx.ownerMint(user1.address, 1, 0);
    });

    it("Should generate token URI for existing token", async function () {
      const tokenURI = await oscillyx.tokenURI(1);
      
      expect(tokenURI).to.include("data:application/json;base64,");
      expect(tokenURI.length).to.be.greaterThan(100); // Should be substantial
    });

    it("Should fail for non-existent token", async function () {
      await expect(
        oscillyx.tokenURI(999)
      ).to.be.revertedWithCustomError(oscillyx, "URIQueryForNonexistentToken");
    });

    it("Should generate different URIs for different tokens", async function () {
      await oscillyx.ownerMint(user1.address, 1, 1); // Different source ID
      
      const uri1 = await oscillyx.tokenURI(1);
      const uri2 = await oscillyx.tokenURI(2);
      
      expect(uri1).to.not.equal(uri2);
    });
  });

  describe("Access Control", function () {
    it("Should allow pausing by owner", async function () {
      await oscillyx.pause();
      expect(await oscillyx.paused()).to.equal(true);
      
      await oscillyx.unpause();
      expect(await oscillyx.paused()).to.equal(false);
    });

    it("Should not allow pausing by non-owner", async function () {
      await expect(
        oscillyx.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject minting when paused", async function () {
      await oscillyx.setMintingActive(true);
      await oscillyx.pause();
      
      await expect(
        oscillyx.ownerMint(user1.address, 1, 0)
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Royalties", function () {
    it("Should return correct royalty info", async function () {
      const [receiver, amount] = await oscillyx.royaltyInfo(1, 10000);
      
      expect(receiver).to.equal(owner.address);
      expect(amount).to.equal(500); // 5% of 10000
    });
  });
});