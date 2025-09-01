const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OscillyxSimple", function () {
  let oscillyx;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const OscillyxSimple = await ethers.getContractFactory("OscillyxSimple");
    oscillyx = await OscillyxSimple.deploy(1000);
    await oscillyx.deployed();
  });

  it("Should mint and generate tokenURI", async function () {
    await oscillyx.mint(user1.address, 1);
    
    expect(await oscillyx.totalSupply()).to.equal(1);
    expect(await oscillyx.balanceOf(user1.address)).to.equal(1);
    
    // Test tokenURI generation
    const tokenURI = await oscillyx.tokenURI(1);
    expect(tokenURI).to.include("data:application/json;base64,");
    expect(tokenURI.length).to.be.greaterThan(100);
    
    console.log("TokenURI length:", tokenURI.length);
    console.log("TokenURI preview:", tokenURI.substring(0, 100) + "...");
  });
});