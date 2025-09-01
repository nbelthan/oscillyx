const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Oscillyx to Monad...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
  
  // Configuration
  const config = {
    maxSupply: process.env.MAX_SUPPLY || 10000,
    signer: process.env.INITIAL_SIGNER || deployer.address,
    royaltyReceiver: process.env.ROYALTY_RECEIVER || deployer.address,
    royaltyFeeNumerator: process.env.ROYALTY_FEE || 500, // 5%
    contractURI: process.env.CONTRACT_URI || "https://oscillyx.art/api/collection"
  };
  
  console.log("📋 Deployment Configuration:");
  console.log("- Max Supply:", config.maxSupply);
  console.log("- Initial Signer:", config.signer);
  console.log("- Royalty Receiver:", config.royaltyReceiver);
  console.log("- Royalty Fee:", config.royaltyFeeNumerator / 100, "%");
  
  // Deploy contract
  console.log("\n📦 Deploying Oscillyx contract...");
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  
  const oscillyx = await Oscillyx.deploy(
    config.maxSupply,
    config.signer,
    config.royaltyReceiver,
    config.royaltyFeeNumerator,
    config.contractURI
  );
  
  await oscillyx.deployed();
  console.log("✅ Oscillyx deployed to:", oscillyx.address);
  
  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  await oscillyx.deployTransaction.wait(5);
  
  // Prepare deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    address: oscillyx.address,
    deployer: deployer.address,
    txHash: oscillyx.deployTransaction.hash,
    blockNumber: oscillyx.deployTransaction.blockNumber,
    gasUsed: oscillyx.deployTransaction.gasLimit?.toString(),
    timestamp: new Date().toISOString(),
    config: config,
    abi: JSON.parse(oscillyx.interface.format('json'))
  };
  
  // Save deployment info
  const deploymentPath = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentPath);
  
  // Verify contract on explorer if API key is provided
  if (process.env.MONAD_API_KEY && process.env.MONAD_API_KEY !== "placeholder") {
    console.log("\n🔍 Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: oscillyx.address,
        constructorArguments: [
          config.maxSupply,
          config.signer,
          config.royaltyReceiver,
          config.royaltyFeeNumerator,
          config.contractURI
        ]
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  } else {
    console.log("\n⚠️ Skipping verification (no API key provided)");
    console.log("To verify manually, run:");
    console.log(`npx hardhat verify --network ${network.name} ${oscillyx.address} ${config.maxSupply} ${config.signer} ${config.royaltyReceiver} ${config.royaltyFeeNumerator} "${config.contractURI}"`);
  }
  
  // Basic contract interaction test
  console.log("\n🧪 Running basic contract tests...");
  
  try {
    const name = await oscillyx.name();
    const symbol = await oscillyx.symbol();
    const maxSupply = await oscillyx.MAX_SUPPLY();
    const signer = await oscillyx.signer();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Max Supply:", maxSupply.toString());
    console.log("- Signer:", signer);
    
    console.log("✅ Contract is responding correctly!");
  } catch (error) {
    console.log("❌ Contract test failed:", error.message);
  }
  
  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${oscillyx.address}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Explorer: https://testnet.monadexplorer.com/address/${oscillyx.address}`);
  console.log(`Transaction: https://testnet.monadexplorer.com/tx/${oscillyx.deployTransaction.hash}`);
  console.log("=".repeat(50));
  
  // Next steps
  console.log("\n📋 Next Steps:");
  console.log("1. Update .env with CONTRACT_ADDRESS=" + oscillyx.address);
  console.log("2. Run: npm run set-signer (if needed)");
  console.log("3. Run: npm run test-mint");
  console.log("4. Deploy frontend and signature service");
  console.log("5. Enable minting with setMintingActive(true)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });