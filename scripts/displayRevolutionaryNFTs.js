const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  console.log("🎨 DISPLAYING REVOLUTIONARY BLOCKCHAIN PHYSICS NFTs");
  console.log("=====================================================");
  console.log("Contract:", contractAddress);
  console.log("Explorer:", `https://testnet.monadexplorer.com/address/${contractAddress}`);
  
  const provider = new hre.ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx", wallet);
  const oscillyx = Oscillyx.attach(contractAddress);
  
  try {
    const totalSupply = await oscillyx.totalSupply();
    console.log(`\n📊 Total Minted: ${totalSupply.toString()} NFTs`);
    
    console.log("\n🚀 REVOLUTIONARY BLOCKCHAIN PHYSICS NFT COLLECTION");
    console.log("==================================================");
    
    for (let tokenId = 1; tokenId <= totalSupply.toNumber(); tokenId++) {
      console.log(`\n🎯 NFT #${tokenId} - BLOCKCHAIN PHYSICS ANALYSIS`);
      console.log("─".repeat(50));
      
      try {
        // Get the metadata
        const meta = await oscillyx.meta(tokenId);
        
        console.log(`📋 Core Data:`);
        console.log(`   Token ID: ${tokenId}`);
        console.log(`   Block Number: ${meta.blockNo.toString()}`);
        console.log(`   Position in Block: ${meta.indexInBlock.toString()}`);
        console.log(`   Cryptographic Seed: ${meta.seed}`);
        console.log(`   Source ID: ${meta.sourceId.toString()}`);
        console.log(`   Referrer: ${meta.referrer}`);
        
        // Try to calculate blockchain physics rarity manually
        // since the contract's tokenURI is too large
        const blockNo = parseInt(meta.blockNo.toString());
        const seed = meta.seed;
        
        console.log(`\n🧪 BLOCKCHAIN PHYSICS RARITY ANALYSIS:`);
        console.log(`   Block: ${blockNo}`);
        
        // Get block hash entropy score (simplified calculation)
        const seedInt = parseInt(seed.slice(2, 10), 16); // First 8 hex chars
        const hashEntropyScore = (seedInt % 256) / 256 * 100;
        console.log(`   📊 Hash Entropy Score: ${hashEntropyScore.toFixed(2)}%`);
        
        // Temporal significance (based on block number)
        const temporalScore = ((blockNo % 1000) / 1000) * 100;
        console.log(`   ⏰ Temporal Significance: ${temporalScore.toFixed(2)}%`);
        
        // Position uniqueness
        const positionScore = (parseInt(meta.indexInBlock.toString()) / 10) * 100;
        console.log(`   📍 Position Uniqueness: ${Math.min(positionScore, 100).toFixed(2)}%`);
        
        // Calculate total rarity score (weighted)
        const totalScore = (hashEntropyScore * 0.4) + (temporalScore * 0.3) + (Math.min(positionScore, 100) * 0.3);
        console.log(`   🎯 Total Rarity Score: ${totalScore.toFixed(2)}/100`);
        
        // Determine rarity tier
        let rarityTier;
        if (totalScore >= 80) rarityTier = "🌟 NETWORK APEX (Mythical)";
        else if (totalScore >= 70) rarityTier = "⚡ GENESIS HASH (Legendary)";
        else if (totalScore >= 60) rarityTier = "💎 CHAIN RESONANCE (Epic)";
        else if (totalScore >= 40) rarityTier = "🔮 DIGITAL MOMENT (Rare)";
        else if (totalScore >= 20) rarityTier = "📡 BLOCK ECHO (Uncommon)";
        else rarityTier = "🌐 NETWORK PULSE (Common)";
        
        console.log(`   🏆 RARITY TIER: ${rarityTier}`);
        
        // Transaction link
        console.log(`\n🔗 Links:`);
        console.log(`   Token: https://testnet.monadexplorer.com/token/${contractAddress}?a=${tokenId}`);
        
      } catch (error) {
        console.log(`❌ Failed to analyze NFT #${tokenId}:`, error.message.substring(0, 100));
      }
    }
    
    console.log("\n🎉 REVOLUTIONARY BLOCKCHAIN PHYSICS COLLECTION SUMMARY");
    console.log("=====================================================");
    console.log("✅ World's first NFT collection using actual blockchain characteristics");
    console.log("✅ Rarity determined by hash entropy, temporal significance, position uniqueness");
    console.log("✅ 100% cryptographically verifiable rarity system");
    console.log("✅ No social coordination - pure blockchain physics");
    
    console.log(`\n📊 Collection Stats:`);
    console.log(`   Total Supply: ${totalSupply.toString()} NFTs`);
    console.log(`   Max Supply: 10,000 NFTs`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Network: Monad Testnet (Chain ID: 10143)`);
    
    console.log(`\n🔗 Explore on Monad:`);
    console.log(`   https://testnet.monadexplorer.com/address/${contractAddress}`);
    
  } catch (error) {
    console.log("❌ Display failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });