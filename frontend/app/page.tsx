'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useContractRead } from 'wagmi';
import { motion } from 'framer-motion';
import { Activity, Zap, Users, Twitter, ExternalLink, Crown, Sparkles, Gift } from 'lucide-react';

import { MintFlow } from '@/components/MintFlow';
import { OscillyxGallery } from '@/components/OscillyxGallery';
import { RarityBreakdown } from '@/components/RarityBreakdown';
import { ColorPaletteShowcase } from '@/components/ColorPaletteShowcase';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { OSCILLYX_ABI, CONTRACT_ADDRESS } from '@/lib/contract';
import { monadTestnet } from '@/lib/wagmi';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [showMintFlow, setShowMintFlow] = useState(false);

  // Preview mode - no minting has occurred yet
  const totalSupply = 0;
  const maxSupply = 10000;
  const mintingActive = false;
  const remainingSupply = maxSupply - totalSupply;

  const isCorrectNetwork = chain?.id === monadTestnet.id;

  return (
    <div className="min-h-screen bg-black">
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 opacity-10 animated-gradient-bg pointer-events-none" />
      {/* Header */}
      <header className="border-b-2 border-cyan-400 bg-black/90 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-400 flex items-center justify-center font-mono text-black font-bold text-xl">
                OSC
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">OSCILLYX</h1>
                <p className="text-sm text-gray-400 font-mono">{totalSupply.toLocaleString()}/{maxSupply.toLocaleString()} MINTED</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isCorrectNetwork && isConnected && <NetworkSwitcher />}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-black/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Gift className="w-8 h-8 text-green-400" />
                <span className="bg-green-900/20 border border-green-400 text-green-400 px-4 py-2 font-mono text-sm font-bold tracking-wider">
                  FREE MINT • 1 PER WALLET
                </span>
                <span className="bg-orange-900/20 border border-orange-400 text-orange-400 px-4 py-2 font-mono text-sm font-bold tracking-wider animate-pulse">
                  LAUNCHING SEPT 2025
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 font-mono tracking-tight">
                10,000
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 animate-pulse">
                  OSCILLYX
                </span>
              </h1>
              
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-24"></div>
                <p className="text-2xl font-mono text-white tracking-wider">
                  BLOCKCHAIN PHYSICS • MATHEMATICAL RARITY
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-24"></div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xl text-gray-300 font-mono leading-relaxed">
                  <span className="text-cyan-400 font-bold">ONLY POSSIBLE ON MONAD:</span> Revolutionary blockchain physics NFT system that would cost <span className="text-red-400 font-bold">$50,000+</span> to deploy on Ethereum.
                </p>
                <p className="text-lg text-gray-400 font-mono">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-bold">
                    1-second blocks × Parallel execution × Ultra-low gas
                  </span> • Perfect temporal granularity for mathematical rarity • Affordable for everyone
                </p>
                <div className="bg-purple-900/20 border border-purple-400 p-4 rounded">
                  <p className="text-purple-300 font-mono text-sm">
                    <span className="text-purple-200 font-bold">Monad Advantage:</span> 10,000 TPS enables real-time blockchain physics calculations that would timeout on other networks
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isConnected) {
                      setShowMintFlow(true);
                    }
                  }}
                  disabled={isConnected}
                  className="bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold py-4 px-8 text-lg border-2 border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Gift className="w-6 h-6 mr-3 inline" />
                  {!isConnected ? 'CONNECT WALLET' : 
                   !isCorrectNetwork ? 'SWITCH TO MONAD' :
                   'COMING SOON - LAUNCHING SEPT 2025'}
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-gray-500 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 font-mono font-bold py-4 px-8 text-lg transition-all text-center"
                >
                  <ExternalLink className="w-5 h-5 mr-2 inline" />
                  VIEW CONTRACT
                </motion.a>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-6 p-6 border-2 border-gray-800 bg-gray-900/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 font-mono">{totalSupply.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 font-mono">MINTED</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 font-mono">{remainingSupply.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 font-mono">REMAINING</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white font-mono">FREE</div>
                  <div className="text-sm text-gray-400 font-mono">PRICE</div>
                </div>
              </div>

              {/* Preview Notice */}
              <div className="mt-4 p-4 bg-orange-900/20 border-2 border-orange-400 rounded-lg">
                <div className="text-center">
                  <p className="text-orange-400 font-mono font-bold text-lg">🚀 PREVIEW MODE</p>
                  <p className="text-orange-300 font-mono text-sm mt-2">
                    Minting disabled. This is a preview of the revolutionary blockchain physics NFT system.
                  </p>
                  <p className="text-white font-mono text-sm mt-1">
                    <span className="text-cyan-400 font-bold">FREE MINT</span> launches Sept 2025 with <span className="text-green-400 font-bold">1 per wallet limit</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: Sample NFTs */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:pl-12"
            >
              <OscillyxGallery />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Revolutionary Algorithm Explanation - THE KEY DIFFERENTIATOR */}
      <section className="py-20 bg-gradient-to-b from-black via-purple-900/10 to-black border-y-4 border-cyan-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 mb-6 font-mono">
              THE REVOLUTIONARY GENERATION ALGORITHM
            </h2>
            <p className="text-2xl text-white font-mono mb-4">
              WORLD'S FIRST NFT WITH PURE BLOCKCHAIN-DERIVED TRAITS
            </p>
            <p className="text-lg text-gray-300 font-mono max-w-4xl mx-auto">
              No metadata servers. No IPFS. No external dependencies. Every single pixel is calculated 
              mathematically from immutable blockchain data and rendered as SVG code directly on-chain.
            </p>
          </div>

          {/* The Complete Algorithm */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-cyan-400 text-center mb-8 font-mono">
              THE COMPLETE ON-CHAIN ALGORITHM
            </h3>
            
            <div className="bg-black border-2 border-cyan-400 p-8 font-mono text-sm">
              <div className="text-green-400 mb-6">
                <p className="text-lg font-bold mb-4">STEP 1: CAPTURE BLOCKCHAIN STATE</p>
                <div className="pl-4 text-gray-300">
                  <p>• Block Number (uint32): Exact Monad block when minted</p>
                  <p>• Position in Block (uint16): Order within that block</p>
                  <p>• Timestamp (uint256): Precise moment of creation</p>
                  <p>• Generate Seed: keccak256(block, position, timestamp)</p>
                </div>
              </div>

              <div className="text-yellow-400 mb-6">
                <p className="text-lg font-bold mb-4">STEP 2: CALCULATE BLOCKCHAIN PHYSICS SCORE</p>
                <div className="pl-4 text-gray-300">
                  <p>• Hash Entropy = seed % 100 (40% weight)</p>
                  <p>• Temporal Significance = blockNumber % 100 (30% weight)</p>
                  <p>• Position Uniqueness = positionInBlock % 100 (30% weight)</p>
                  <p>• Total Score = (hashEntropy × 2) + temporalSig + positionUniq</p>
                  <p className="text-cyan-300 mt-2">Score Range: 0-400 determines rarity tier</p>
                </div>
              </div>

              <div className="text-purple-400 mb-6">
                <p className="text-lg font-bold mb-4">STEP 3: DETERMINE VISUAL COMPLEXITY</p>
                <div className="pl-4 text-gray-300">
                  <p>• Score 0-99: Network Pulse (concentric rings)</p>
                  <p>• Score 100-199: Block Echo (wave interference)</p>
                  <p>• Score 200-299: Digital Moment (crystal diamonds)</p>
                  <p>• Score 300-349: Chain Resonance (mandala patterns)</p>
                  <p>• Score 350-399: Genesis Hash (Fibonacci spirals)</p>
                  <p>• Score 400+: Network Apex (sacred geometry)</p>
                </div>
              </div>

              <div className="text-orange-400">
                <p className="text-lg font-bold mb-4">STEP 4: GENERATE SVG ON-CHAIN</p>
                <div className="pl-4 text-gray-300">
                  <p>• Primary Hue = seed % 360 (background gradient)</p>
                  <p>• Secondary Hue = (seed &gt;&gt; 8) % 360 (main patterns)</p>
                  <p>• Tertiary Hue = (seed &gt;&gt; 16) % 360 (accents)</p>
                  <p>• Construct SVG paths based on rarity tier</p>
                  <p>• Encode as base64 data URI</p>
                  <p className="text-cyan-300 mt-2">Result: Complete NFT image generated from pure math</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Is Revolutionary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="border-2 border-purple-500 bg-purple-900/20 p-8">
              <h4 className="text-2xl font-bold text-purple-400 mb-4 font-mono">
                TRADITIONAL NFTs
              </h4>
              <ul className="space-y-3 text-gray-300 font-mono text-sm">
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Artist creates 10,000 images manually</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Images stored on centralized servers/IPFS</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Rarity decided by human (subjective)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Metadata can be changed/lost</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Requires trust in project team</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Can disappear if servers go down</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-cyan-400 bg-cyan-900/20 p-8">
              <h4 className="text-2xl font-bold text-cyan-400 mb-4 font-mono">
                OSCILLYX NFTs
              </h4>
              <ul className="space-y-3 text-gray-300 font-mono text-sm">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Generated mathematically from blockchain data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>100% stored on-chain forever (no external deps)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Rarity from cryptographic truth (objective)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Immutable - can NEVER be changed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Trustless - pure mathematics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Exists as long as Monad exists</span>
                </li>
              </ul>
            </div>
          </div>

          {/* The 7 On-Chain Traits */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-orange-400 text-center mb-8 font-mono">
              7 IMMUTABLE ON-CHAIN TRAITS PER NFT
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Rarity Tier</p>
                <p className="text-xs text-gray-400 font-mono">Network Pulse to Network Apex</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Physics Score</p>
                <p className="text-xs text-gray-400 font-mono">0-400+ mathematical rarity</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Block Number</p>
                <p className="text-xs text-gray-400 font-mono">Exact Monad block of mint</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Position in Block</p>
                <p className="text-xs text-gray-400 font-mono">Order within block (1st, 2nd...)</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Primary Hue</p>
                <p className="text-xs text-gray-400 font-mono">0-360° background color</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Secondary Hue</p>
                <p className="text-xs text-gray-400 font-mono">0-360° pattern color</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Tertiary Hue</p>
                <p className="text-xs text-gray-400 font-mono">0-360° accent color</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-4">
                <p className="text-cyan-400 font-bold font-mono mb-1">Cryptographic Seed</p>
                <p className="text-xs text-gray-400 font-mono">Unique 128-bit identifier</p>
              </div>
            </div>
          </div>

          {/* Epic Statement */}
          <div className="text-center bg-gradient-to-r from-cyan-900/30 via-purple-900/30 to-orange-900/30 border-4 border-transparent bg-clip-padding" 
               style={{ borderImage: 'linear-gradient(to right, #00D4FF, #9D00FF, #FF4500) 1' }}>
            <div className="p-12">
              <h3 className="text-4xl font-bold text-white mb-6 font-mono">
                WHY THIS CHANGES EVERYTHING
              </h3>
              <p className="text-xl text-cyan-400 font-mono mb-4">
                FIRST TIME IN HISTORY: NFT RARITY FROM PHYSICS, NOT PEOPLE
              </p>
              <p className="text-lg text-gray-300 font-mono mb-6 max-w-4xl mx-auto">
                Every other NFT collection requires you to trust that "golden fur" is rarer than "silver fur" 
                because someone decided it should be. Oscillyx requires zero trust - rarity emerges from the 
                immutable mathematics of the blockchain itself.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                <div>
                  <p className="text-green-400 font-bold font-mono mb-2">VERIFIABLE</p>
                  <p className="text-sm text-gray-400 font-mono">
                    Anyone can recalculate the rarity from the block hash. No hidden algorithms.
                  </p>
                </div>
                <div>
                  <p className="text-purple-400 font-bold font-mono mb-2">ETERNAL</p>
                  <p className="text-sm text-gray-400 font-mono">
                    As long as Monad blockchain exists, these NFTs exist. No servers needed.
                  </p>
                </div>
                <div>
                  <p className="text-orange-400 font-bold font-mono mb-2">TRUSTLESS</p>
                  <p className="text-sm text-gray-400 font-mono">
                    Pure mathematics. No team can rug. No metadata can change. Forever.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <ColorPaletteShowcase />

      {/* Rarity Breakdown */}
      <RarityBreakdown />

      {/* Color Traits Explanation Section */}
      <section className="py-16 border-t-2 border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 font-mono">
              COLORS AS BLOCKCHAIN TRAITS
            </h2>
            <p className="text-lg text-gray-300 font-mono max-w-4xl mx-auto mb-8">
              Every NFT's colors are mathematically derived from its blockchain hash. 
              No random generation - pure deterministic color traits from cryptographic data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="border border-cyan-400 bg-cyan-900/10 p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-3 font-mono">PRIMARY HUE</h3>
              <p className="text-sm text-gray-300 font-mono mb-2">
                Derived from first 8 bytes of block hash
              </p>
              <p className="text-xs text-gray-400 font-mono">
                <span className="text-cyan-300">Formula:</span> hash % 360 = hue degree
              </p>
              <p className="text-xs text-gray-500 font-mono mt-2">
                Creates background gradient and primary color theme
              </p>
            </div>
            
            <div className="border border-purple-400 bg-purple-900/10 p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3 font-mono">SECONDARY HUE</h3>
              <p className="text-sm text-gray-300 font-mono mb-2">
                Derived from middle 8 bytes of hash
              </p>
              <p className="text-xs text-gray-400 font-mono">
                <span className="text-purple-300">Formula:</span> (hash &gt;&gt; 8) % 360
              </p>
              <p className="text-xs text-gray-500 font-mono mt-2">
                Defines pattern strokes and accent colors
              </p>
            </div>
            
            <div className="border border-orange-400 bg-orange-900/10 p-6">
              <h3 className="text-lg font-bold text-orange-400 mb-3 font-mono">TERTIARY HUE</h3>
              <p className="text-sm text-gray-300 font-mono mb-2">
                Derived from last 8 bytes of hash
              </p>
              <p className="text-xs text-gray-400 font-mono">
                <span className="text-orange-300">Formula:</span> (hash &gt;&gt; 16) % 360
              </p>
              <p className="text-xs text-gray-500 font-mono mt-2">
                Adds depth with additional accent elements
              </p>
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-700 p-6 text-center">
            <p className="text-cyan-400 font-mono font-bold mb-2">
              DETERMINISTIC COLOR GENERATION
            </p>
            <p className="text-sm text-gray-300 font-mono">
              Same block hash = Same colors every time. Colors are permanent NFT traits stored on-chain.
            </p>
            <p className="text-xs text-gray-400 font-mono mt-2">
              Each NFT has 3 color traits: Primary Hue (0-360°), Secondary Hue (0-360°), Tertiary Hue (0-360°)
            </p>
          </div>
        </div>
      </section>

      {/* Why Unique Section */}
      <section className="py-20 border-t-2 border-gray-800 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 font-mono">
              REVOLUTIONARY RARITY
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400">
                BLOCKCHAIN PHYSICS POWERED
              </span>
            </h2>
            <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto">
              Each Oscillyx NFT's rarity and visual complexity is determined by pure blockchain mathematics.
              No social coordination required - just cryptographic truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-2 border-cyan-400 bg-black p-8 text-center"
            >
              <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4 font-mono">HASH ENTROPY ANALYSIS</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                Cryptographic seed analysis determines base visual complexity. Higher entropy = more sophisticated mathematical patterns and richer color palettes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-2 border-purple-500 bg-black p-8 text-center"
            >
              <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4 font-mono">BLOCKCHAIN PHYSICS RARITY</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold">WORLD'S FIRST</span> NFT using actual blockchain characteristics: hash entropy × temporal significance × position uniqueness. Pure mathematical rarity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-2 border-green-400 bg-black p-8 text-center"
            >
              <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4 font-mono">100% ON-CHAIN GENERATION</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                SVG art generated entirely on-chain from blockchain physics. No servers, no IPFS, no dependencies. Pure mathematical art that exists forever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-16 border-t-2 border-gray-800 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-mono">
            JOIN THE BLOCKCHAIN PHYSICS REVOLUTION
          </h2>
          <p className="text-xl text-gray-300 mb-8 font-mono leading-relaxed">
            Be part of the world's first NFT collection using actual blockchain characteristics for rarity. Genesis Hash and Network Apex rarities await discovery.
          </p>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_HANDLE?.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-lg border-2 border-blue-600 hover:border-blue-500 transition-all"
          >
            <Twitter className="w-6 h-6 mr-3" />
            FOLLOW @{process.env.NEXT_PUBLIC_TWITTER_HANDLE?.replace('@', '')}
          </motion.a>
        </div>
      </section>

      {/* Mint Flow Modal */}
      {showMintFlow && (
        <MintFlow 
          isOpen={showMintFlow} 
          onClose={() => setShowMintFlow(false)} 
        />
      )}
    </div>
  );
}