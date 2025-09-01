# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Project Architecture

**Oscillyx** - On-chain generative art NFT collection on Monad network with deterministic SVG generation from block hashes.

### Core Components

1. **Smart Contracts** (`contracts/`)
   - `Oscillyx.sol` - Main NFT contract with on-chain SVG generation
   - `Oscillyx10K.sol` - 10K collection variant
   - `OscillyxOptimized.sol` - Gas-optimized version
   - `OscillyxSimple.sol` - Simplified implementation
   - `libs/` - Base64 encoding and geometry utilities

2. **Frontend** (`frontend/`)
   - Next.js 14 app with TypeScript
   - Wagmi v1 + RainbowKit for Web3 integration
   - Framer Motion for animations
   - Tailwind CSS for styling

3. **Signature Service** (`signature-service/`)
   - Cloudflare Worker for mint signature generation
   - Deployed via Wrangler

4. **Generation Scripts**
   - `generate-optimized-oscillyx.js` - Creates gas-optimized SVGs
   - `view-improved-oscillyx.html` - Preview generated samples
   - `view-10k-variations.html` - View 10K collection variants

## 🛠️ Development Commands

### Smart Contract Development
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
npx hardhat test test/Oscillyx.test.js  # Single test file

# Deploy to Monad testnet
npx hardhat run scripts/deploy.js --network monadTestnet

# Test minting
npx hardhat run scripts/testMint.js --network monadTestnet

# Check cohort/rendering
npx hardhat run scripts/checkCohort.js --network monadTestnet
npx hardhat run scripts/renderSample.js --network monadTestnet

# Set signer address
npx hardhat run scripts/setSigner.js --network monadTestnet
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Signature Service
```bash
cd signature-service

# Install dependencies
npm install

# Deploy to Cloudflare
npm run deploy

# Test locally
npm run dev
```

### SVG Generation
```bash
# Generate new optimized samples
node generate-optimized-oscillyx.js

# View samples in browser
open view-improved-oscillyx.html
open view-10k-variations.html
```

## 🌐 Network Configuration

### Monad Testnet
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: 10143
- **Explorer**: `https://testnet.monadexplorer.com`
- **Gas Price**: Auto

### Environment Variables (.env)
```bash
PRIVATE_KEY=your_private_key
MONAD_API_KEY=your_explorer_api_key
MAX_SUPPLY=10000
INITIAL_SIGNER=0x...
ROYALTY_RECEIVER=0x...
CONTRACT_URI=https://oscillyx.art/api/collection
```

## 🎯 PROVEN SUCCESSFUL APPROACHES

### ✅ IPFS Upload Solution: Lighthouse Storage API
**RULE: Always use Lighthouse Storage API for IPFS uploads - it has proven to work consistently**

- **Working API Configuration:**
  ```javascript
  const apiKey = 'd98387f8.13c86b7f07014fcf90dd6b506776a6a3';
  const baseUrl = 'https://node.lighthouse.storage';
  const endpoint = `${baseUrl}/api/v0/add?wrap-with-directory=true`;
  ```

- **Successful Upload Pattern:**
  1. Use FormData with all files
  2. Add `wrap-with-directory=true` parameter for proper directory structure
  3. Use `filepath: filename` for individual file access
  4. Results in working tokenURI pattern: `https://gateway.lighthouse.storage/ipfs/CID/metadata/tokenId`

### ✅ NFT Metadata Format for Magic Eden Compatibility
**RULE: Always use clean trait names without numeric prefixes or underscores**

- **Working Format:**
  ```json
  {
    "name": "Oscillyx #1",
    "description": "On-chain generative art",
    "image": "data:image/svg+xml;base64,...",
    "attributes": [
      {"trait_type": "Style", "value": "Noir"},
      {"trait_type": "Cohort", "value": "Genesis"},
      {"trait_type": "Strands", "value": "3"}
    ]
  }
  ```

### ✅ Contract Deployment and Updates
**RULE: Always use ethers.providers.JsonRpcProvider (not ethers.JsonRpcProvider)**

- **Working RPC:** `https://testnet-rpc.monad.xyz`
- **Working Contract Pattern:** ERC-721A with proper baseURI management
- **Gas Limit:** 300,000 for baseURI updates

## ❌ FAILED APPROACHES - NEVER USE THESE

### ❌ Web Interface Uploads
**RULE: Never rely on web interfaces for uploads - they consistently fail**

- Pinata Web Interface: Shows "Error uploading file: Unknown"
- Web3.Storage Web Interface: Unreliable for large folder uploads
- Any Upload UI: Prefer API-first approach always

### ❌ Archive/Compressed Uploads
**RULE: Never use compressed archives for NFT metadata - they break tokenURI access**

- Archives don't provide individual file access needed for tokenURI
- tar.gz, zip files create single CID instead of directory structure

## 📊 Gas Optimization Techniques

### SVG Generation Optimizations
- **512-entry LUT** for trigonometry (prevents double artifacts)
- **720→240 oversample** pipeline with MA(3) smoothing
- **Adaptive path compression** (4-step gentle, 3-step sharp)
- **Ghost quantization** to 2px grid
- **Cohort-aware rendering** adjusts complexity

### Gas Usage Targets
| Style | Size Range | Gas Range | Cost @ 50 gwei |
|-------|------------|-----------|----------------|
| Noir  | 2.8-4.0 KB | 110K-138K | ~0.006 ETH |
| Neon  | 5.1-6.4 KB | 160K-190K | ~0.009 ETH |

## 🔑 Key Contract Features

### Oscillyx Contract
- **On-chain SVG generation** from block hashes
- **Deterministic art** - same seed always produces same output
- **Cohort system** - Genesis (1-1000), Essence (1001-5000), Eternity (5001-10000)
- **Dynamic ghost strands** based on cohort and style
- **ERC-2981 royalties** support
- **Signature-based minting** for controlled access

### Security Features
- Reentrancy guards on minting
- Signature verification for mint authorization
- Admin functions for signer updates
- Pausable minting mechanism

## 🚀 Deployment Checklist

1. **Pre-deployment**
   - [ ] Set environment variables in `.env`
   - [ ] Run full test suite: `npx hardhat test`
   - [ ] Verify gas optimization: `REPORT_GAS=true npx hardhat test`

2. **Deployment**
   - [ ] Deploy contract: `npx hardhat run scripts/deploy.js --network monadTestnet`
   - [ ] Save deployment info from `deployments/` directory
   - [ ] Verify on explorer if available

3. **Post-deployment**
   - [ ] Test mint: `npx hardhat run scripts/testMint.js --network monadTestnet`
   - [ ] Update frontend contract address
   - [ ] Deploy signature service to Cloudflare
   - [ ] Test full mint flow through frontend

## 📋 PROJECT-SPECIFIC CONFIGURATIONS

### Contract Information (Testnet)
- **Address:** `0x4eba94d2B83427c3baf78bC0E9F67c7f2fCb5F4e`
- **Network:** Monad Testnet
- **RPC:** `https://testnet-rpc.monad.xyz`
- **Owner:** `0x36983B1b28BAFeCC05AC74Cd3E9B0F5E83a9FD09`

### Successful IPFS Results
- **Latest Working CID:** `bafybeif4i4hxbf5rslp3myyibm337avhal3y4vrmxiv3gqwmyo4xcmc6qi`
- **Base URI:** `https://gateway.lighthouse.storage/ipfs/bafybeif4i4hxbf5rslp3myyibm337avhal3y4vrmxiv3gqwmyo4xcmc6qi/metadata/`

## 💡 KEY PRINCIPLES

1. **Gas First**: Always optimize for gas efficiency in on-chain operations
2. **Deterministic**: Same inputs must always produce identical outputs
3. **API-First**: Use proven API solutions over web interfaces
4. **Test Coverage**: Run tests before any deployment or major change
5. **Proven Path**: Use solutions that have worked before experimenting with new ones