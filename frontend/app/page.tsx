'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useContractRead } from 'wagmi';
import { motion } from 'framer-motion';
import { Activity, Zap, Users, Twitter, ExternalLink, Crown, Sparkles, Gift, Palette } from 'lucide-react';

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

  // Mock data for demo (replace with real contract reads when deployed)
  const totalSupply = 847;
  const maxSupply = 10000;
  const mintingActive = true;
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
                BW
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
                  FREE MINT
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
                  ONE STYLE • INFINITE COLORS
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-24"></div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xl text-gray-300 font-mono leading-relaxed">
                  Each NFT features the same <span className="text-cyan-400 font-bold">high-quality generative art</span> with unique colors determined by block data.
                </p>
                <p className="text-lg text-gray-400 font-mono">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-bold">
                    20 distinct color palettes
                  </span> from Electric Blue to Quantum Violet. Every token is visually unique.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMintFlow(true)}
                  disabled={!isConnected || !isCorrectNetwork || !mintingActive}
                  className="bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold py-4 px-8 text-lg border-2 border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Gift className="w-6 h-6 mr-3 inline" />
                  {!isConnected ? 'CONNECT WALLET' : 
                   !isCorrectNetwork ? 'SWITCH TO MONAD' :
                   !mintingActive ? 'MINTING PAUSED' : 'MINT YOUR COLORS'}
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

      {/* Color Palette Showcase */}
      <ColorPaletteShowcase />

      {/* Rarity Breakdown */}
      <RarityBreakdown />

      {/* Why Unique Section */}
      <section className="py-20 border-t-2 border-gray-800 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 font-mono">
              ONE MASTERPIECE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400">
                10,000 COLOR EXPRESSIONS
              </span>
            </h2>
            <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto">
              Every Oscillyx uses the same high-quality Lissajous algorithm. What makes yours unique? 
              The colors, determined entirely by block data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-2 border-cyan-400 bg-black p-8 text-center"
            >
              <Palette className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4 font-mono">20 COLOR PALETTES</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                Block hash determines your palette: Electric Blue, Quantum Violet, Golden Hour, and 17 more. Each with unique gradients and effects.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-2 border-purple-500 bg-black p-8 text-center"
            >
              <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4 font-mono">TWO-LAYER RARITY</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                Color palette rarity (Common to Legendary) × Cohort density (Solo to Surge). Special effects for rare rolls: shimmer, glow, animation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-2 border-green-400 bg-black p-8 text-center"
            >
              <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4 font-mono">FOREVER UNIQUE</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                100% on-chain SVG generation means your NFT will exist as long as Ethereum does. No servers, no IPFS, no dependencies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-16 border-t-2 border-gray-800 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-mono">
            JOIN THE COLOR REVOLUTION
          </h2>
          <p className="text-xl text-gray-300 mb-8 font-mono leading-relaxed">
            Get notified when legendary palettes are minted and rare cohort events occur
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