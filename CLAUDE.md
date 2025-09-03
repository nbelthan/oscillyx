# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Oscillyx** - World's first NFT collection with rarity determined by actual blockchain characteristics instead of social coordination patterns.

### Revolutionary Blockchain Physics Rarity System

**Three-Factor Mathematical Analysis:**
1. **Hash Entropy (40% weight)**: Leading zeros, trailing zeros, repeating patterns in block hash
2. **Temporal Significance (30% weight)**: Block timestamp mathematical properties
3. **Position Uniqueness (30% weight)**: Block number and token position analysis

**Rarity Tiers:**
- **Network Pulse (0)** - ~34% - Basic blockchain patterns
- **Block Echo (1)** - ~30% - Enhanced entropy resonance  
- **Digital Moment (2)** - ~20% - Significant temporal markers
- **Chain Resonance (3)** - ~10% - Complex blockchain physics
- **Network Apex (4)** - ~5% - Exceptional blockchain events
- **Genesis Hash (5)** - ~1% - Perfect cryptographic convergence

## Essential Commands

### Smart Contract Development
```bash
# Install dependencies
npm install

# Compile contracts with blockchain physics rarity
npx hardhat compile

# Run tests
npx hardhat test
npx hardhat test test/Oscillyx.test.js  # Main test file

# Deploy to Monad testnet
npx hardhat run scripts/deploy.js --network monadTestnet

# Test minting functionality
npx hardhat run scripts/testMint.js --network monadTestnet

# Showcase NFT generation
npx hardhat run scripts/showcaseFinal.js --network monadTestnet
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (Vercel)
npm run build

# Run linting
npm run lint
```

### Signature Service (Cloudflare Worker)
```bash
cd signature-service

# Install dependencies
npm install

# Deploy to Cloudflare
npm run deploy

# Test locally
npm run dev
```

## Architecture & Key Files

### Smart Contracts (`contracts/`)
- **`Oscillyx.sol`** - Main NFT contract with revolutionary blockchain physics rarity
  - `_getBlockBasedRarity()` - Core rarity calculation using blockchain characteristics
  - `_generateRarityBasedArt()` - Visual complexity based on blockchain physics
  - 100% on-chain SVG generation with progressive complexity
  - Gas optimized: 110K-190K per mint including complexity calculation
- **`libs/GeometryLib.sol`** - Mathematical utilities for curve generation
- **`libs/Base64Simple.sol`** - On-chain SVG encoding

### Frontend (`frontend/`)
- Next.js 14 with TypeScript, TailwindCSS, and RainbowKit
- **`app/page.tsx`** - Landing page showcasing revolutionary approach
- **`components/RarityBreakdown.tsx`** - Interactive blockchain physics explanation
- **`components/MintDialog.tsx`** - Signature-based minting interface
- **`config/contract.ts`** - Contract ABI and configuration
- Vercel Analytics integration for user tracking

### Backend Services
- **`signature-service/`** - Cloudflare Worker for secure signature generation
  - Twitter verification integration
  - Rate limiting and security measures
  - KV storage for tracking mints

### Deployment Scripts (`scripts/`)
- **`deploy.js`** - Main deployment script
- **`testMint.js`** - Test minting functionality
- **`showcaseFinal.js`** - Generate showcase NFTs for demonstration
- **`setSigner.js`** - Update authorized signer address

## Network Configuration

**Monad Testnet**
- RPC: `https://testnet-rpc.monad.xyz`
- Chain ID: `10143`
- Explorer: `https://testnet.monadexplorer.com`
- Contract: `0x4eba94d2B83427c3baf78bC0E9F67c7f2fCb5F4e`

**Provider Configuration:**
```javascript
// Always use ethers.providers.JsonRpcProvider (not ethers.JsonRpcProvider)
const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
```

## Environment Variables

### Root `.env`
```
PRIVATE_KEY=<deployment wallet private key>
MONAD_API_KEY=<explorer API key>
```

### Frontend `.env.local`
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4eba94d2B83427c3baf78bC0E9F67c7f2fCb5F4e
NEXT_PUBLIC_SIGNATURE_SERVICE_URL=<cloudflare worker URL>
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### Signature Service `.dev.vars`
```
SIGNER_PRIVATE_KEY=<authorized signer private key>
TWITTER_BEARER_TOKEN=<twitter API token>
```

## Critical Implementation Notes

### Blockchain Physics Rarity System
**NEVER revert to social coordination (cohort size) rarity.** The current blockchain physics system is:
- More mathematically sound
- Truly decentralized
- Cannot be gamed or manipulated
- Creates objective rarity based on cryptographic characteristics

### Visual Generation Alignment
**Visual complexity MUST match rarity tier.** Each tier produces distinct complexity:
- Network Pulse (0): Single clean curve
- Block Echo (1): + Secondary harmonic
- Digital Moment (2): + Ghost strands
- Chain Resonance (3): + Interference patterns
- Network Apex (4-5): Maximum complexity with geometric overlays

### Gas Optimization
- Contract uses ERC721A for batch optimization
- Complex SVG generation optimized to ~150K gas
- String manipulation uses assembly for efficiency
- Contract size: ~26KB (near limit due to complexity)

## Testing Approach

### Unit Tests
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Oscillyx.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### Integration Testing
```bash
# Test minting on testnet
npx hardhat run scripts/testMint.js --network monadTestnet

# Generate showcase NFTs
npx hardhat run scripts/showcaseFinal.js --network monadTestnet
```

### Frontend Testing
- Manual testing with RainbowKit wallet integration
- Test signature-based minting flow
- Verify rarity display and explanations

## Deployment Workflow

1. **Smart Contract Deployment**
   ```bash
   npx hardhat run scripts/deploy.js --network monadTestnet
   ```

2. **Update Frontend Configuration**
   - Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in frontend `.env.local`
   - Update contract ABI if changed

3. **Deploy Signature Service**
   ```bash
   cd signature-service
   npm run deploy
   ```

4. **Deploy Frontend to Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

5. **Set Authorized Signer**
   ```bash
   npx hardhat run scripts/setSigner.js --network monadTestnet
   ```

## Key Principles

1. **Revolutionary Rarity**: Always use blockchain physics, never social coordination
2. **100% On-Chain**: All metadata and visuals generated in tokenURI()
3. **Gas Optimization**: Keep minting under 200K gas
4. **Visual Complexity**: Must align with mathematical rarity tier
5. **Deterministic**: Same blockchain inputs = same visual output

## Common Tasks

### View NFT Metadata
```javascript
// Direct contract call
const tokenURI = await contract.tokenURI(tokenId);
// Decode base64 to see JSON metadata
```

### Check Rarity Distribution
```javascript
// Use scripts/debugRarity.js to analyze rarity for specific blocks
npx hardhat run scripts/debugRarity.js --network monadTestnet
```

### Update Base Configuration
```javascript
// Only owner can call these functions
await contract.setMintingActive(true);
await contract.setMaxPerTx(5);
await contract.setAuthorizedSigner(newSignerAddress);
```

## Troubleshooting

### Common Issues
1. **"Insufficient funds"**: Ensure wallet has MON tokens from faucet
2. **"Invalid signature"**: Check signature service is running and signer matches contract
3. **"Minting not active"**: Owner needs to call setMintingActive(true)
4. **Gas estimation failed**: May need manual gas limit (300000)

### Debugging Tips
- Use `scripts/debugRarity.js` to test rarity calculations
- Check block explorer for transaction details
- Frontend console shows signature verification status
- Contract events emit detailed minting information