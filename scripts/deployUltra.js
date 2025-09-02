const hre = require("hardhat");

async function main() {
  console.log("🔥 Deploying ULTRA-SAFE Oscillyx to Monad...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  const OscillyxUltra = await hre.ethers.getContractFactory("OscillyxUltra");
  const oscillyx = await OscillyxUltra.deploy(10000);
  
  await oscillyx.deployed();
  
  console.log("✅ OscillyxUltra deployed to:", oscillyx.address);
  
  // Test immediately
  console.log("\n🧪 IMMEDIATE TESTS:");
  console.log("──────────────────");
  
  const name = await oscillyx.name();
  console.log("✅ Name:", name);
  
  const symbol = await oscillyx.symbol();
  console.log("✅ Symbol:", symbol);
  
  // Test mint and tokenURI immediately
  console.log("\n🎯 CRITICAL TEST - Mint & TokenURI:");
  console.log("──────────────────────────────────");
  
  try {
    // Mint one NFT
    console.log("Minting test NFT...");
    const mintTx = await oscillyx.ownerMint(deployer.address, 1);
    await mintTx.wait();
    console.log("✅ NFT minted!");
    
    // Test tokenURI immediately
    console.log("Testing tokenURI...");
    const uri = await oscillyx.tokenURI(0);
    
    if (uri && uri.length > 0) {
      console.log("🎉 SUCCESS! TokenURI works!");
      console.log(`   Length: ${uri.length} characters`);
      
      if (uri.startsWith('data:application/json;utf8,')) {
        const json = uri.substring('data:application/json;utf8,'.length);
        const metadata = JSON.parse(json);
        console.log(`   Name: ${metadata.name}`);
        console.log(`   Rarity: ${metadata.attributes[0].value}`);
        console.log(`   Block: ${metadata.attributes[1].value}`);
        console.log(`   Image: ${metadata.image.substring(0, 50)}...`);
        console.log("🎨 VISUAL NFT GENERATION WORKING!");
      }
    } else {
      console.log("❌ TokenURI failed - empty response");
    }
    
  } catch (error) {
    console.log("❌ Critical test failed:", error.message);
  }
  
  console.log("\n🎯 ULTRA-SAFE DEPLOYMENT COMPLETE");
  console.log("===================================");
  console.log("Contract:", oscillyx.address);
  console.log("Explorer:", `https://testnet.monadexplorer.com/address/${oscillyx.address}`);
  console.log("\nTo use: Update .env with CONTRACT_ADDRESS=" + oscillyx.address);
}

main().catch(console.error);