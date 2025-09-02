const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  console.log("🔍 DEBUGGING BLOCKCHAIN PHYSICS RARITY CALCULATION");
  console.log("Contract Address:", contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  console.log("Current Block:", currentBlock);
  
  // Test blockhash access
  console.log("\n🔍 Testing blockhash access:");
  for (let i = 1; i <= 5; i++) {
    try {
      const testBlock = currentBlock - i;
      const blockHash = await hre.ethers.provider.getBlock(testBlock).then(b => b.hash);
      const blockHashFunc = await hre.ethers.provider.call({
        to: contractAddress,
        data: "0x" // This won't work, just testing approach
      });
      console.log(`Block ${testBlock}: ${blockHash}`);
    } catch (error) {
      console.log(`Block ${currentBlock - i}: Error -`, error.message.substring(0, 50));
    }
  }
  
  // Test direct contract calls
  console.log("\n🧪 Testing basic contract functions:");
  try {
    const totalSupply = await oscillyx.totalSupply();
    console.log("✅ Total Supply:", totalSupply.toString());
    
    const maxSupply = await oscillyx.MAX_SUPPLY();
    console.log("✅ Max Supply:", maxSupply.toString());
    
    // Test meta data for token 1
    console.log("\n🔍 Testing meta data for token 1:");
    const meta = await oscillyx.meta(1);
    console.log("Token 1 Meta:", {
      blockNo: meta.blockNo.toString(),
      indexInBlock: meta.indexInBlock.toString(),
      seed: meta.seed,
      sourceId: meta.sourceId.toString(),
      referrer: meta.referrer
    });
    
  } catch (error) {
    console.log("❌ Basic function error:", error.message);
  }
  
  // Test the issue - try to call tokenURI which is failing
  console.log("\n🚨 Testing tokenURI (the failing function):");
  try {
    const tokenURI = await oscillyx.tokenURI(1);
    console.log("✅ TokenURI works! Length:", tokenURI.length);
  } catch (error) {
    console.log("❌ TokenURI error:", error.message);
    console.log("Error code:", error.code);
    console.log("Error data:", error.data);
    
    if (error.data) {
      // Decode the panic reason
      const panicCode = parseInt(error.data.slice(-2), 16);
      console.log("Panic code:", panicCode);
      
      const panicReasons = {
        17: "Arithmetic overflow/underflow or division by zero",
        18: "Division or modulo by zero",
        33: "Enum conversion out of bounds",
        34: "Invalid storage byte array access",
        49: "Pop from empty array",
        50: "Array access out of bounds"
      };
      
      console.log("Panic reason:", panicReasons[panicCode] || "Unknown");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Debug failed:", error);
    process.exit(1);
  });