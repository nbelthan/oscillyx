const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const blockNumber = process.argv[2];
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  console.log("🔍 Checking cohort information for Oscillyx...");
  console.log("Contract Address:", contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  // Get current block if not specified
  const targetBlock = blockNumber ? parseInt(blockNumber) : await hre.ethers.provider.getBlockNumber();
  
  console.log(`\n📊 Cohort Analysis for Block ${targetBlock}:`);
  
  try {
    // Get cohort info
    const cohortInfo = await oscillyx.getCohortInfo(targetBlock);
    const cohortSize = cohortInfo.count.toNumber();
    const cohortDigest = cohortInfo.digest;
    
    console.log("- Cohort Size:", cohortSize);
    console.log("- Cohort Digest:", cohortDigest);
    
    if (cohortSize === 0) {
      console.log("⚠️ No mints found in this block");
      return;
    }
    
    // Determine density tier
    let densityTier;
    if (cohortSize === 1) densityTier = "Solo";
    else if (cohortSize === 2) densityTier = "Pair";
    else if (cohortSize === 3) densityTier = "Trio";
    else if (cohortSize === 4) densityTier = "Quartet";
    else if (cohortSize <= 8) densityTier = "Octet";
    else densityTier = "Surge";
    
    console.log("- Density Tier:", densityTier);
    
    // Check if poster was minted
    const posterMinted = await oscillyx.posterMinted(targetBlock);
    console.log("- Poster Minted:", posterMinted);
    
    if (posterMinted) {
      const posterTokenId = await oscillyx.posterTokenId(targetBlock);
      console.log("- Poster Token ID:", posterTokenId.toString());
    }
    
    // Get all tokens from this block
    console.log("\n🎯 Searching for tokens from this block...");
    const totalSupply = await oscillyx.totalSupply();
    
    const blockTokens = [];
    for (let tokenId = 1; tokenId <= totalSupply.toNumber(); tokenId++) {
      try {
        const meta = await oscillyx.getTokenMeta(tokenId);
        if (meta.blockNo === targetBlock) {
          blockTokens.push({
            tokenId,
            indexInBlock: meta.indexInBlock,
            sourceId: meta.sourceId,
            referrer: meta.referrer,
            seed: meta.seed
          });
        }
      } catch (error) {
        // Token might not exist, skip
        continue;
      }
    }
    
    console.log(`Found ${blockTokens.length} tokens from block ${targetBlock}:`);
    
    blockTokens
      .sort((a, b) => a.indexInBlock - b.indexInBlock)
      .forEach(token => {
        const isPoster = token.indexInBlock === 65535; // type(uint16).max
        const sourceNames = ["Twitter", "Discord", "Telegram", "Layer3", "Galxe"];
        const sourceName = token.sourceId === 255 ? "Poster" : (sourceNames[token.sourceId] || "Unknown");
        
        console.log(`  Token #${token.tokenId}: ${isPoster ? 'POSTER' : `Index ${token.indexInBlock}`}, Source: ${sourceName}`);
      });
    
    // Analyze cohort characteristics
    console.log("\n📈 Cohort Characteristics:");
    const sources = {};
    blockTokens.forEach(token => {
      if (token.sourceId !== 255) { // Exclude posters
        sources[token.sourceId] = (sources[token.sourceId] || 0) + 1;
      }
    });
    
    console.log("- Source Distribution:");
    const sourceNames = ["Twitter", "Discord", "Telegram", "Layer3", "Galxe"];
    Object.entries(sources).forEach(([sourceId, count]) => {
      const name = sourceNames[sourceId] || `Source ${sourceId}`;
      console.log(`  ${name}: ${count} mints`);
    });
    
    // Visual characteristics preview
    if (cohortSize > 0) {
      console.log("\n🎨 Visual Characteristics:");
      console.log(`- Density Tier: ${densityTier} (affects ghost strand count)`);
      console.log(`- Ghost Strands: ${cohortSize < 2 ? 0 : Math.min(3, cohortSize - 1)}`);
      console.log(`- Cohort Digest Hash: ${cohortDigest.substring(0, 10)}...`);
    }
    
  } catch (error) {
    console.error("❌ Error checking cohort:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });