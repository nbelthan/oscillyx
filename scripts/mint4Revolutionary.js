const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  console.log("🚀 REVOLUTIONARY BLOCKCHAIN PHYSICS NFT MINTING");
  console.log("==================================================");
  console.log("Contract:", contractAddress);
  
  // Set network to monadTestnet
  const provider = new hre.ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Deployer:", wallet.address);
  
  const balance = await wallet.getBalance();
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  const Oscillyx = await hre.ethers.getContractFactory("Oscillyx", wallet);
  const oscillyx = Oscillyx.attach(contractAddress);
  
  try {
    // Test basic contract info
    console.log("\n📊 REVOLUTIONARY CONTRACT STATE:");
    console.log("──────────────────────────────────────────────────");
    
    const name = await oscillyx.name();
    console.log("✅ Name:", name);
    
    const symbol = await oscillyx.symbol();
    console.log("✅ Symbol:", symbol);
    
    const totalSupply = await oscillyx.totalSupply();
    console.log("✅ Total Supply:", totalSupply.toString());
    
    const maxSupply = await oscillyx.MAX_SUPPLY();
    console.log("✅ Max Supply:", maxSupply.toString());
    
    // Check if minting is active
    const mintingActive = await oscillyx.mintingActive();
    console.log("✅ Minting Active:", mintingActive);
    
    if (!mintingActive) {
      console.log("\n🔧 Activating minting...");
      const activateTx = await oscillyx.setMintingActive(true);
      await activateTx.wait();
      console.log("✅ Minting activated!");
    }
    
    // Mint 4 revolutionary NFTs
    console.log("\n🎨 MINTING 4 REVOLUTIONARY BLOCKCHAIN PHYSICS NFTs:");
    console.log("──────────────────────────────────────────────────────");
    
    for (let i = 1; i <= 4; i++) {
      console.log(`\n🔹 Minting NFT #${i}...`);
      
      try {
        const mintTx = await oscillyx.ownerMint(wallet.address, 1, 0);
        const receipt = await mintTx.wait();
        console.log(`✅ NFT #${i} minted! Transaction: ${receipt.transactionHash}`);
        
        // Get the token ID from the transfer event
        const transferEvent = receipt.events?.find(e => e.event === "Transfer");
        if (transferEvent) {
          const tokenId = transferEvent.args.tokenId.toString();
          console.log(`   Token ID: ${tokenId}`);
          
          // Try to get metadata (this might fail due to contract size)
          try {
            const meta = await oscillyx.meta(tokenId);
            console.log(`   📊 Blockchain Physics Data:`);
            console.log(`      Block: ${meta.blockNo.toString()}`);
            console.log(`      Seed: ${meta.seed.substring(0, 10)}...`);
            console.log(`      Index: ${meta.indexInBlock.toString()}`);
            
            // Try tokenURI (might fail due to size)
            try {
              const uri = await oscillyx.tokenURI(tokenId);
              console.log(`   🎯 TokenURI generated successfully (${uri.length} chars)`);
            } catch (uriError) {
              console.log(`   ❌ TokenURI generation failed:`, uriError.message.substring(0, 80));
            }
          } catch (metaError) {
            console.log(`   ❌ Meta data access failed:`, metaError.message.substring(0, 80));
          }
        }
        
        // Wait between mints to avoid nonce issues
        if (i < 4) {
          console.log("   ⏳ Waiting 3 seconds...");
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (mintError) {
        console.log(`❌ Minting NFT #${i} failed:`, mintError.message.substring(0, 100));
      }
    }
    
    console.log("\n🎉 REVOLUTIONARY BLOCKCHAIN PHYSICS MINTING COMPLETE!");
    console.log("==================================================");
    
    const finalSupply = await oscillyx.totalSupply();
    console.log(`Final Total Supply: ${finalSupply.toString()}`);
    console.log(`Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
    
  } catch (error) {
    console.log("❌ Revolutionary minting failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });