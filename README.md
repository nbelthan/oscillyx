# Oscillyx Optimized - On-Chain Generative Art

## 📁 Project Structure

### Core Files
- **`generate-optimized-oscillyx.js`** - Generates gas-optimized Oscillyx SVGs
  - 512-entry LUT for high-quality trigonometry
  - 720→240 oversample pipeline with MA(3) smoothing
  - Adaptive path compression (4-step on gentle turns, 3-step otherwise)
  - Ghost quantization to 2px grid
  - Cohort-aware rendering

- **`view-improved-oscillyx.html`** - View all generated samples in browser

### Generated Samples
- **Noir variants** (`noir-optimized-[1-5].svg`)
  - 2.8-4.0 KB (avg 3.5 KB)
  - ~110K-138K gas
  - 0-1 ghost strands based on cohort size

- **Neon variants** (`neon-optimized-[1-5].svg`)
  - 5.1-6.4 KB (avg 5.6 KB)  
  - ~160K-190K gas
  - 2-3 ghost strands based on cohort size

### Supporting Infrastructure
- **`contracts/`** - Solidity contracts
- **`frontend/`** - React frontend application
- **`scripts/`** - Deployment and utility scripts
- **`signature-service/`** - Backend signature service

## 🚀 Quick Start

### View Samples
```bash
open view-improved-oscillyx.html
```

### Regenerate Samples
```bash
node generate-optimized-oscillyx.js
```

## 📊 Gas Optimization Results

| Style | Size Range | Gas Range | Cost @ 50 gwei |
|-------|------------|-----------|----------------|
| Noir  | 2.8-4.0 KB | 110K-138K | ~0.006 ETH |
| Neon  | 5.1-6.4 KB | 160K-190K | ~0.009 ETH |

## 🎯 Key Features

- **High Quality**: 512-entry LUT prevents double artifacts
- **Smooth Curves**: 720-point oversampling with moving average
- **Efficient**: Adaptive compression reduces size by 15-20%
- **Dynamic**: Cohort-aware ghost strands
- **Textured**: Subtle hatch patterns add depth

## 🔧 Next Steps

Ready to deploy on-chain with Solidity contract that generates these SVGs entirely in `tokenURI()`.