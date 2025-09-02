const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  console.log("🚀 Minting 4 Revolutionary Blockchain Physics NFTs...");
  console.log("Contract Address:", contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting Account:", deployer.address);
  
  // Get contract instance
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  // Check initial state
  console.log("\n📊 Contract State:");
  const totalSupply = await oscillyx.totalSupply();
  const maxSupply = await oscillyx.MAX_SUPPLY();
  const mintingActive = await oscillyx.mintingActive();
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  
  console.log("- Total Supply:", totalSupply.toString());
  console.log("- Max Supply:", maxSupply.toString());
  console.log("- Minting Active:", mintingActive);
  console.log("- Current Block:", currentBlock);
  
  // Enable minting if not active
  if (!mintingActive) {
    console.log("\n🔄 Enabling minting...");
    const tx = await oscillyx.setMintingActive(true);
    await tx.wait();
    console.log("✅ Minting enabled!");
  }
  
  // Mint 4 NFTs
  console.log("\n🎯 Minting 4 Blockchain Physics NFTs...");
  const mintTx = await oscillyx.ownerMint(deployer.address, 4, 0); // sourceId 0 = Twitter
  console.log("Transaction Hash:", mintTx.hash);
  
  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  const receipt = await mintTx.wait();
  
  // Parse events
  const mintedEvents = receipt.events.filter(e => e.event === "Minted");
  console.log(`✅ Successfully minted ${mintedEvents.length} NFTs!`);
  
  console.log("\n" + "=".repeat(60));
  console.log("🎨 DISPLAYING ALL 4 REVOLUTIONARY BLOCKCHAIN PHYSICS NFTs");
  console.log("=".repeat(60));
  
  // Process each minted NFT
  for (let i = 0; i < mintedEvents.length; i++) {
    const event = mintedEvents[i];
    const { to, tokenId, blockNo, indexInBlock, sourceId } = event.args;
    
    console.log(`\n🚀 NFT #${i + 1} - Token ID: ${tokenId}`);
    console.log("─".repeat(40));
    console.log(`📍 Block: ${blockNo} | Index: ${indexInBlock} | Source: ${sourceId}`);
    
    try {
      // Get blockchain physics rarity data
      const tokenMeta = await oscillyx.getTokenMeta(tokenId);
      console.log(`🧬 Seed: ${tokenMeta.seed}`);
      
      // Get full tokenURI with metadata and SVG
      const tokenURI = await oscillyx.tokenURI(tokenId);
      console.log(`✅ TokenURI generated! (${tokenURI.length} characters)`);
      
      if (tokenURI.startsWith("data:application/json;base64,")) {
        // Decode the metadata
        const jsonB64 = tokenURI.replace("data:application/json;base64,", "");
        const jsonStr = Buffer.from(jsonB64, 'base64').toString();
        const metadata = JSON.parse(jsonStr);
        
        console.log(`📋 Name: ${metadata.name}`);
        console.log(`📝 Description: ${metadata.description.substring(0, 100)}...`);
        
        // Find the RarityTier attribute
        const rarityTrait = metadata.attributes.find(attr => attr.trait_type === "RarityTier");
        if (rarityTrait) {
          console.log(`🌟 BLOCKCHAIN PHYSICS RARITY: ${rarityTrait.value}`);
        }
        
        // Extract and save SVG
        if (metadata.image && metadata.image.startsWith("data:image/svg+xml;base64,")) {
          const svgB64 = metadata.image.replace("data:image/svg+xml;base64,", "");
          const svgContent = Buffer.from(svgB64, 'base64').toString();
          
          // Save SVG to file
          const fileName = `nft_${tokenId}_${rarityTrait ? rarityTrait.value.replace(' ', '_') : 'unknown'}.svg`;
          fs.writeFileSync(fileName, svgContent);
          console.log(`💾 SVG saved to: ${fileName}`);
          
          // Display SVG content preview
          console.log("🎨 SVG PREVIEW:");
          console.log("─".repeat(60));
          console.log(svgContent.substring(0, 400) + "...");
          console.log("─".repeat(60));
          
          // Show key attributes
          console.log("📊 KEY ATTRIBUTES:");
          metadata.attributes.slice(0, 8).forEach(attr => {
            console.log(`   • ${attr.trait_type}: ${attr.value}`);
          });
          
        } else {
          console.log("❌ No valid SVG found in metadata");
        }
        
        console.log(`🔗 Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
        
      } else {
        console.log("❌ Invalid tokenURI format");
      }
      
    } catch (error) {
      console.log(`❌ Error processing NFT ${tokenId}:`, error.message);
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 MINTING SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successfully minted: ${mintedEvents.length} NFTs`);
  console.log(`🚀 Revolutionary Blockchain Physics Rarity: ACTIVE`);
  console.log(`📁 SVG files saved to current directory`);
  console.log(`🌐 View on Monad Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minting failed:");
    console.error(error);
    process.exit(1);
  });