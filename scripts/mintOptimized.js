const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  console.log("🎨 TESTING OPTIMIZED BLOCKCHAIN PHYSICS NFTs");
  console.log("===============================================");
  console.log("Contract:", contractAddress);
  
  const provider = new hre.ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Deployer:", wallet.address);
  
  const balance = await wallet.getBalance();
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  const OscillyxOptimized = await hre.ethers.getContractFactory("OscillyxOptimized", wallet);
  const oscillyx = OscillyxOptimized.attach(contractAddress);
  
  try {
    console.log("\n📊 CONTRACT STATE:");
    console.log("──────────────────────────────");
    
    const name = await oscillyx.name();
    console.log("✅ Name:", name);
    
    const symbol = await oscillyx.symbol();
    console.log("✅ Symbol:", symbol);
    
    const totalSupply = await oscillyx.totalSupply();
    console.log("✅ Total Supply:", totalSupply.toString());
    
    const mintingActive = await oscillyx.mintingActive();
    console.log("✅ Minting Active:", mintingActive);
    
    if (!mintingActive) {
      console.log("\n🔧 Activating minting...");
      const activateTx = await oscillyx.setMintingActive(true);
      await activateTx.wait();
      console.log("✅ Minting activated!");
    }
    
    // Mint test NFTs
    console.log("\n🚀 MINTING TEST NFTs:");
    console.log("──────────────────────────────");
    
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
          
          // Test metadata access
          try {
            const meta = await oscillyx.meta(tokenId);
            console.log(`   📊 Metadata: Block ${meta.blockNo}, Index ${meta.indexInBlock}`);
            
            // **THE CRUCIAL TEST** - Try tokenURI generation
            console.log(`   🎯 Testing tokenURI generation...`);
            const uri = await oscillyx.tokenURI(tokenId);
            
            if (uri && uri.length > 0) {
              console.log(`   ✅ SUCCESS! TokenURI generated (${uri.length} chars)`);
              
              // Decode and show a snippet
              if (uri.startsWith('data:application/json;utf8,')) {
                const json = uri.substring('data:application/json;utf8,'.length);
                const metadata = JSON.parse(json);
                console.log(`   🎨 Name: ${metadata.name}`);
                console.log(`   🏆 Rarity: ${metadata.attributes[0].value}`);
                console.log(`   📦 Block: ${metadata.attributes[1].value}`);
              }
            } else {
              console.log(`   ❌ TokenURI is empty or null`);
            }
          } catch (uriError) {
            console.log(`   ❌ TokenURI generation failed:`, uriError.message.substring(0, 100));
          }
        }
        
        // Wait between mints
        if (i < 4) {
          console.log("   ⏳ Waiting 2 seconds...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (mintError) {
        console.log(`❌ Minting NFT #${i} failed:`, mintError.message.substring(0, 100));
      }
    }
    
    console.log("\n🎉 OPTIMIZED TEST COMPLETE!");
    console.log("===============================================");
    
    const finalSupply = await oscillyx.totalSupply();
    console.log(`Final Total Supply: ${finalSupply.toString()}`);
    console.log(`Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
    
    // Test one more tokenURI to show the visual generation works
    if (finalSupply.toNumber() > 0) {
      console.log("\n🎨 DEMONSTRATING VISUAL GENERATION:");
      console.log("─────────────────────────────────────");
      try {
        const tokenId = 1;
        const uri = await oscillyx.tokenURI(tokenId);
        
        if (uri.startsWith('data:application/json;utf8,')) {
          const json = uri.substring('data:application/json;utf8,'.length);
          const metadata = JSON.parse(json);
          
          console.log("✅ Sample NFT Metadata:");
          console.log(`   Name: ${metadata.name}`);
          console.log(`   Description: ${metadata.description}`);
          console.log(`   Rarity: ${metadata.attributes[0].value}`);
          console.log(`   Block: ${metadata.attributes[1].value}`);
          console.log(`   Entropy: ${metadata.attributes[2].value}`);
          
          if (metadata.image && metadata.image.startsWith('data:image/svg+xml;utf8,')) {
            const svgStart = metadata.image.substring(0, 100);
            console.log(`   Image: SVG generated (${metadata.image.length} chars)`);
            console.log(`   Preview: ${svgStart}...`);
          }
        }
      } catch (error) {
        console.log("❌ Visual generation test failed:", error.message);
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