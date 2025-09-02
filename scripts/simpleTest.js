const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  console.log("🧪 SIMPLE TEST SEQUENCE");
  console.log("Contract:", contractAddress);
  
  try {
    // Test 1: Basic contract functions
    console.log("\n1. Testing basic functions:");
    const name = await oscillyx.name();
    console.log("✅ name():", name);
    
    const symbol = await oscillyx.symbol();
    console.log("✅ symbol():", symbol);
    
    const totalSupply = await oscillyx.totalSupply();
    console.log("✅ totalSupply():", totalSupply.toString());
    
    // Test 2: Token exists check
    console.log("\n2. Testing token existence:");
    const exists = await oscillyx._exists(1);
    console.log("✅ _exists(1):", exists);
    
    if (!exists) {
      console.log("❌ Token 1 doesn't exist, cannot test tokenURI");
      return;
    }
    
    // Test 3: Get meta data
    console.log("\n3. Testing meta data:");
    const meta = await oscillyx.meta(1);
    console.log("✅ meta(1):", {
      blockNo: meta.blockNo.toString(),
      seed: meta.seed,
      indexInBlock: meta.indexInBlock.toString()
    });
    
    // Test 4: Test tokenURI step by step
    console.log("\n4. Testing tokenURI step by step:");
    
    // First just try to call tokenURI and catch the exact error
    try {
      console.log("🔍 Calling tokenURI(1)...");
      const uri = await oscillyx.tokenURI(1);
      console.log("✅ Success! URI length:", uri.length);
    } catch (error) {
      console.log("❌ tokenURI failed with error:");
      console.log("Message:", error.message);
      console.log("Code:", error.code);
      console.log("Data:", error.data);
      
      if (error.data) {
        const errorCode = error.data.slice(-2);
        console.log("Panic code:", parseInt(errorCode, 16));
      }
    }
    
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });