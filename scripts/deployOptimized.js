const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying OPTIMIZED Oscillyx to Monad...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Deployer balance:", hre.ethers.utils.formatEther(balance));
  
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "(chainId:", network.chainId + ")");
  
  // Deployment configuration
  const maxSupply = 10000;
  const signer = deployer.address;
  
  console.log("📋 Deployment Configuration:");
  console.log("- Max Supply:", maxSupply);
  console.log("- Authorized Signer:", signer);
  
  console.log("\n📦 Deploying OscillyxOptimized contract...");
  
  const OscillyxOptimized = await hre.ethers.getContractFactory("OscillyxOptimized");
  const oscillyx = await OscillyxOptimized.deploy(
    maxSupply,
    signer
  );
  
  await oscillyx.deployed();
  
  console.log("✅ OscillyxOptimized deployed to:", oscillyx.address);
  console.log("⏳ Waiting for block confirmations...");
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contractAddress: oscillyx.address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    maxSupply: maxSupply,
    signer: signer,
    contractName: "OscillyxOptimized"
  };
  
  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const filename = `optimized-${network.name}-deployment.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Deployment info saved to:", filepath);
  
  // Test basic functions
  console.log("\n🧪 Running basic contract tests...");
  try {
    const name = await oscillyx.name();
    console.log("✅ name():", name);
    
    const symbol = await oscillyx.symbol();
    console.log("✅ symbol():", symbol);
    
    const totalSupply = await oscillyx.totalSupply();
    console.log("✅ totalSupply():", totalSupply.toString());
    
    const maxSupplyCheck = await oscillyx.MAX_SUPPLY();
    console.log("✅ MAX_SUPPLY():", maxSupplyCheck.toString());
    
    const mintingActive = await oscillyx.mintingActive();
    console.log("✅ mintingActive():", mintingActive);
    
  } catch (error) {
    console.log("❌ Contract test failed:", error.message);
  }
  
  console.log("\n🎉 OPTIMIZED DEPLOYMENT SUMMARY:");
  console.log("==================================================");
  console.log("Contract Address:", oscillyx.address);
  console.log("Network:", network.name, "(" + network.chainId + ")");
  console.log("Explorer:", `https://testnet.monadexplorer.com/address/${oscillyx.address}`);
  console.log("==================================================");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Update .env with CONTRACT_ADDRESS=" + oscillyx.address);
  console.log("2. Run: node scripts/mintOptimized.js");
  console.log("3. Test tokenURI generation");
  console.log("4. Verify visual NFTs display properly");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });