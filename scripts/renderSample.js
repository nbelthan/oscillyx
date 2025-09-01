const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  console.log("🎨 Testing SVG rendering for Oscillyx...");
  
  const [deployer] = await hre.ethers.getSigners();
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  // Enable minting if not active
  const mintingActive = await oscillyx.mintingActive();
  if (!mintingActive) {
    console.log("🔄 Enabling minting...");
    await oscillyx.setMintingActive(true);
  }
  
  // Mint a test token
  console.log("🔨 Minting test token...");
  const tx = await oscillyx.ownerMint(deployer.address, 1, 0);
  await tx.wait();
  
  const totalSupply = await oscillyx.totalSupply();
  const tokenId = totalSupply.toNumber();
  
  console.log(`✅ Minted token #${tokenId}`);
  
  // Test each rendering component separately
  console.log("\n🧪 Testing rendering components...");
  
  try {
    // Test metadata retrieval
    console.log("1. Testing metadata retrieval...");
    const meta = await oscillyx.getTokenMeta(tokenId);
    console.log(`   ✅ Block: ${meta.blockNo}, Index: ${meta.indexInBlock}, Source: ${meta.sourceId}`);
    
    // Test cohort info
    console.log("2. Testing cohort info...");
    const cohortInfo = await oscillyx.getCohortInfo(meta.blockNo);
    console.log(`   ✅ Cohort Size: ${cohortInfo.count}, Digest: ${cohortInfo.digest.substring(0, 10)}...`);
    
    // Test basic contract info
    console.log("3. Testing contract info...");
    const name = await oscillyx.name();
    const symbol = await oscillyx.symbol();
    console.log(`   ✅ Name: ${name}, Symbol: ${symbol}`);
    
    // Test _exists function
    console.log("4. Testing token existence...");
    // We can't call _exists directly, but tokenURI will check it
    
    // Now try tokenURI generation
    console.log("5. Testing tokenURI generation...");
    const tokenURI = await oscillyx.tokenURI(tokenId);
    console.log("   ✅ TokenURI generated successfully!");
    console.log(`   Length: ${tokenURI.length} characters`);
    
    // Parse and display metadata
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const jsonB64 = tokenURI.replace("data:application/json;base64,", "");
      const jsonStr = Buffer.from(jsonB64, 'base64').toString();
      const metadata = JSON.parse(jsonStr);
      
      console.log("\n📋 Generated Metadata:");
      console.log(`   Name: ${metadata.name}`);
      console.log(`   Description: ${metadata.description.substring(0, 80)}...`);
      console.log(`   Attributes: ${metadata.attributes.length} traits`);
      
      // Display some key traits
      const traits = {};
      metadata.attributes.forEach(attr => {
        traits[attr.trait_type] = attr.value;
      });
      
      console.log("\n🎯 Key Traits:");
      console.log(`   Block: ${traits.Block}`);
      console.log(`   Cohort Size: ${traits.CohortSize}`);  
      console.log(`   Density Tier: ${traits.DensityTier}`);
      console.log(`   Style Pack: ${traits.StylePack}`);
      console.log(`   Energy Score: ${traits.EnergyScore}`);
      
      // Check SVG
      if (metadata.image && metadata.image.startsWith("data:image/svg+xml;base64,")) {
        const svgB64 = metadata.image.replace("data:image/svg+xml;base64,", "");
        const svgStr = Buffer.from(svgB64, 'base64').toString();
        console.log(`\n🎨 Generated SVG (${svgStr.length} chars):`);
        console.log(svgStr.substring(0, 200) + "...");
      }
    }
    
  } catch (error) {
    console.error("❌ Error in rendering test:");
    console.error("Error message:", error.message);
    console.error("Error reason:", error.reason);
    console.error("Error code:", error.code);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:");
    console.error(error);
    process.exit(1);
  });