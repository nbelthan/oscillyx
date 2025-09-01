const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const newSigner = process.env.NEW_SIGNER;
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  if (!newSigner) {
    console.error("❌ Please set NEW_SIGNER environment variable");
    process.exit(1);
  }
  
  console.log("🔄 Setting new signer for Oscillyx contract...");
  console.log("Contract Address:", contractAddress);
  console.log("New Signer:", newSigner);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Admin Address:", deployer.address);
  
  // Get contract instance
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx");
  const oscillyx = Oscillyx.attach(contractAddress);
  
  // Check current signer
  const currentSigner = await oscillyx.signer();
  console.log("Current Signer:", currentSigner);
  
  if (currentSigner.toLowerCase() === newSigner.toLowerCase()) {
    console.log("✅ Signer is already set correctly!");
    return;
  }
  
  // Set new signer
  console.log("📝 Setting new signer...");
  const tx = await oscillyx.setSigner(newSigner);
  console.log("Transaction Hash:", tx.hash);
  
  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  
  // Verify change
  const updatedSigner = await oscillyx.signer();
  console.log("Updated Signer:", updatedSigner);
  
  if (updatedSigner.toLowerCase() === newSigner.toLowerCase()) {
    console.log("✅ Signer updated successfully!");
  } else {
    console.log("❌ Signer update failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });