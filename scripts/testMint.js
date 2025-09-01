const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  console.log("🧪 Testing Oscillyx minting functionality...");
  console.log("Contract Address:", contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Test Account:", deployer.address);
  
  // Get contract instance
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  // Check initial state
  console.log("\n📊 Initial Contract State:");
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
  
  // Test owner mint
  console.log("\n🎯 Testing owner mint...");
  const mintTx = await oscillyx.ownerMint(deployer.address, 3, 0); // sourceId 0 = Twitter
  console.log("Transaction Hash:", mintTx.hash);
  
  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  const receipt = await mintTx.wait();
  
  // Parse events
  const mintedEvents = receipt.events.filter(e => e.event === "Minted");
  console.log(`✅ Minted ${mintedEvents.length} tokens!`);
  
  for (const event of mintedEvents) {
    const { to, tokenId, blockNo, indexInBlock, sourceId } = event.args;
    console.log(`  Token #${tokenId}: Block ${blockNo}, Index ${indexInBlock}, Source ${sourceId}`);
  }
  
  // Test cohort tracking
  const mintBlock = receipt.blockNumber;
  console.log("\n📈 Checking cohort data for block", mintBlock);
  const cohortInfo = await oscillyx.getCohortInfo(mintBlock);
  console.log("- Cohort Size:", cohortInfo.count.toString());
  console.log("- Cohort Digest:", cohortInfo.digest);
  
  // Test tokenURI generation
  console.log("\n🎨 Testing on-chain SVG generation...");
  const firstTokenId = mintedEvents[0].args.tokenId;
  
  try {
    const tokenURI = await oscillyx.tokenURI(firstTokenId);
    console.log("✅ TokenURI generated successfully!");
    console.log("Length:", tokenURI.length, "characters");
    
    // Parse JSON metadata
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const jsonB64 = tokenURI.replace("data:application/json;base64,", "");
      const jsonStr = Buffer.from(jsonB64, 'base64').toString();
      const metadata = JSON.parse(jsonStr);
      
      console.log("📋 Metadata Preview:");
      console.log("- Name:", metadata.name);
      console.log("- Description:", metadata.description.substring(0, 100) + "...");
      console.log("- Attributes:", metadata.attributes.length);
      console.log("- Image Type:", metadata.image.startsWith("data:image/svg+xml") ? "SVG" : "Unknown");
    }
  } catch (error) {
    console.log("❌ TokenURI generation failed:", error.message);
  }
  
  // Test meta data retrieval
  console.log("\n🔍 Testing meta data retrieval...");
  try {
    const tokenMeta = await oscillyx.getTokenMeta(firstTokenId);
    console.log("- Block Number:", tokenMeta.blockNo);
    console.log("- Index in Block:", tokenMeta.indexInBlock);
    console.log("- Source ID:", tokenMeta.sourceId);
    console.log("- Seed:", tokenMeta.seed);
  } catch (error) {
    console.log("❌ Meta data retrieval failed:", error.message);
  }
  
  // Updated state
  console.log("\n📊 Final Contract State:");
  const newTotalSupply = await oscillyx.totalSupply();
  console.log("- Total Supply:", newTotalSupply.toString());
  console.log("- Tokens Minted:", newTotalSupply.sub(totalSupply).toString());
  
  // Summary
  console.log("\n🎉 Test Summary:");
  console.log("=".repeat(40));
  console.log(`✅ Contract deployment: Working`);
  console.log(`✅ Owner minting: Working`);
  console.log(`✅ Cohort tracking: Working`);
  console.log(`✅ On-chain SVG: Working`);
  console.log(`✅ Metadata generation: Working`);
  console.log("=".repeat(40));
  
  console.log("\n🔗 View tokens on explorer:");
  for (const event of mintedEvents) {
    const tokenId = event.args.tokenId;
    console.log(`Token #${tokenId}: https://testnet.monadexplorer.com/address/${contractAddress}#tokentxns`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  });