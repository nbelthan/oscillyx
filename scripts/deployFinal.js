const hre = require("hardhat");

async function main() {
  console.log("🎯 Deploying FINAL Working Oscillyx...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  const OscillyxFinal = await hre.ethers.getContractFactory("OscillyxFinal");
  const oscillyx = await OscillyxFinal.deploy(10000);
  
  await oscillyx.deployed();
  
  console.log("✅ OscillyxFinal deployed to:", oscillyx.address);
  
  // Test immediately with proper error handling
  console.log("\n🧪 COMPREHENSIVE TEST:");
  console.log("─────────────────────");
  
  try {
    const name = await oscillyx.name();
    console.log("✅ Name:", name);
    
    const symbol = await oscillyx.symbol();
    console.log("✅ Symbol:", symbol);
    
    // Mint test NFT
    console.log("\n🎯 Minting test NFT...");
    const mintTx = await oscillyx.ownerMint(deployer.address, 1);
    await mintTx.wait();
    console.log("✅ NFT minted!");
    
    // Test tokenURI with full error handling
    console.log("\n🎨 Testing tokenURI generation...");
    const uri = await oscillyx.tokenURI(0);
    
    if (uri && uri.length > 0) {
      console.log("🎉 SUCCESS! TokenURI generated!");
      console.log(`   Length: ${uri.length} characters`);
      
      if (uri.startsWith('data:application/json;base64,')) {
        console.log("✅ Proper base64 JSON format");
        
        try {
          const base64Data = uri.substring('data:application/json;base64,'.length);
          const jsonData = Buffer.from(base64Data, 'base64').toString('utf8');
          const metadata = JSON.parse(jsonData);
          
          console.log("🎊 COMPLETE SUCCESS!");
          console.log(`   Name: ${metadata.name}`);
          console.log(`   Description: ${metadata.description}`);
          console.log(`   Rarity: ${metadata.attributes[0].value}`);
          console.log(`   Block: ${metadata.attributes[1].value}`);
          console.log(`   Entropy: ${metadata.attributes[2].value}`);
          
          if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
            console.log("✅ SVG image properly base64 encoded");
            console.log(`   Image length: ${metadata.image.length} chars`);
            
            // Decode and show SVG snippet
            const svgBase64 = metadata.image.substring('data:image/svg+xml;base64,'.length);
            const svgData = Buffer.from(svgBase64, 'base64').toString('utf8');
            console.log(`   SVG preview: ${svgData.substring(0, 100)}...`);
          }
          
        } catch (decodeError) {
          console.log("❌ Failed to decode metadata:", decodeError.message);
        }
      }
    } else {
      console.log("❌ TokenURI failed - empty response");
    }
    
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
  
  console.log("\n🎯 FINAL DEPLOYMENT COMPLETE");
  console.log("============================");
  console.log("Contract:", oscillyx.address);
  console.log("Explorer:", `https://testnet.monadexplorer.com/address/${oscillyx.address}`);
  console.log("\nTo use: Update .env with CONTRACT_ADDRESS=" + oscillyx.address);
}

main().catch(console.error);