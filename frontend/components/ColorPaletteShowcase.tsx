'use client';

import { motion } from 'framer-motion';
import { Sparkles, Star, Zap, Crown, Activity, Hash } from 'lucide-react';

// Blockchain Physics Rarity Tiers - matching our smart contract
const RARITY_TIERS = [
  { 
    name: 'Network Pulse', 
    description: 'Concentric blockchain rings',
    color: '#00D4FF', 
    rarity: 'Common',
    percentage: '45-55%',
    physics: 'Low hash entropy + standard temporal patterns',
    visual: 'Simple circles, basic colors'
  },
  { 
    name: 'Block Echo', 
    description: 'Geometric wave transmission',
    color: '#FF6EC7', 
    rarity: 'Common',
    percentage: '25-35%', 
    physics: 'Medium hash entropy + temporal significance',
    visual: 'Wave patterns, dual colors'
  },
  { 
    name: 'Digital Moment', 
    description: 'Crystalline data structures',
    color: '#FFD700', 
    rarity: 'Rare',
    percentage: '10-15%',
    physics: 'High temporal significance + position uniqueness',
    visual: 'Diamond crystals, rich gradients'
  },
  { 
    name: 'Chain Resonance', 
    description: 'Network harmony mandala',
    color: '#00FF88', 
    rarity: 'Epic',
    percentage: '3-7%',
    physics: 'High hash entropy + unique position patterns',
    visual: 'Mandala with crosshairs, gold accents'
  },
  { 
    name: 'Genesis Hash', 
    description: 'Fibonacci spiral perfection',
    color: '#FF4500', 
    rarity: 'Legendary',
    percentage: '1-2%',
    physics: 'Maximum temporal significance + rare entropy',
    visual: 'Mathematical spirals, golden ratio'
  },
  { 
    name: 'Network Apex', 
    description: 'Sacred hexagonal geometry',
    color: '#9D00FF', 
    rarity: 'Mythical',
    percentage: '<1%',
    physics: 'Perfect blockchain physics alignment',
    visual: 'Sacred geometry, animated effects'
  }
];

function getRarityIcon(rarity: string) {
  switch(rarity) {
    case 'Mythical': return <Crown className="w-4 h-4" />;
    case 'Legendary': return <Zap className="w-4 h-4" />;
    case 'Epic': return <Star className="w-4 h-4" />;
    case 'Rare': return <Hash className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
}

function getRarityColor(rarity: string) {
  switch(rarity) {
    case 'Mythical': return 'text-purple-400 border-purple-400';
    case 'Legendary': return 'text-orange-400 border-orange-400';
    case 'Epic': return 'text-green-400 border-green-400';
    case 'Rare': return 'text-yellow-400 border-yellow-400';
    default: return 'text-cyan-400 border-cyan-400';
  }
}

export function ColorPaletteShowcase() {
  return (
    <section className="py-20 border-t-2 border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 font-mono">
            🚀 BLOCKCHAIN PHYSICS RARITY TIERS
          </h2>
          <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto leading-relaxed">
            <span className="text-cyan-400 font-bold">ONLY POSSIBLE ON MONAD:</span> Revolutionary blockchain physics rarity system that would cost $50,000+ on Ethereum.
            <br />
            <span className="text-orange-400">Monad's 1-second blocks + parallel execution + ultra-low gas = Mathematical rarity for everyone</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {RARITY_TIERS.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`border bg-gray-900/50 p-6 hover:scale-105 transition-all duration-300 ${
                tier.rarity === 'Mythical' ? 'border-purple-400 shadow-lg shadow-purple-400/20' :
                tier.rarity === 'Legendary' ? 'border-orange-400 shadow-lg shadow-orange-400/20' :
                tier.rarity === 'Epic' ? 'border-green-400 shadow-lg shadow-green-400/20' :
                tier.rarity === 'Rare' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' :
                'border-cyan-400 shadow-lg shadow-cyan-400/20'
              }`}
            >
              {/* Complex Blockchain Physics Visual Preview */}
              <div className="h-32 w-32 mx-auto mb-4 relative overflow-hidden flex items-center justify-center">
                {/* Network Pulse - Concentric rings */}
                {index === 0 && (
                  <svg width="128" height="128" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1a1a1a' }}>
                    <defs>
                      <radialGradient id="bg0" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="hsl(200, 40%, 15%)"/>
                        <stop offset="100%" stopColor="hsl(200, 60%, 8%)"/>
                      </radialGradient>
                    </defs>
                    <rect width="400" height="400" fill="url(#bg0)"/>
                    <circle cx="200" cy="200" r="80" fill="none" stroke="#00D4FF" strokeWidth="3" opacity="0.8"/>
                    <circle cx="200" cy="200" r="60" fill="none" stroke="#00D4FF" strokeWidth="2" opacity="0.6"/>
                    <circle cx="200" cy="200" r="40" fill="none" stroke="#00D4FF" strokeWidth="2" opacity="0.4"/>
                  </svg>
                )}

                {/* Block Echo - Intersecting waves */}
                {index === 1 && (
                  <svg width="128" height="128" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1a1a1a' }}>
                    <defs>
                      <radialGradient id="bg1" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="hsl(320, 50%, 18%)"/>
                        <stop offset="100%" stopColor="hsl(320, 70%, 10%)"/>
                      </radialGradient>
                    </defs>
                    <rect width="400" height="400" fill="url(#bg1)"/>
                    <circle cx="200" cy="200" r="100" fill="none" stroke="#FF6EC7" strokeWidth="4" opacity="0.7"/>
                    <circle cx="170" cy="170" r="60" fill="none" stroke="#FF6EC7" strokeWidth="3" opacity="0.5"/>
                    <circle cx="230" cy="230" r="60" fill="none" stroke="#FF8EC7" strokeWidth="3" opacity="0.5"/>
                  </svg>
                )}

                {/* Digital Moment - Crystal diamond */}
                {index === 2 && (
                  <svg width="128" height="128" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1a1a1a' }}>
                    <defs>
                      <radialGradient id="bg2" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="hsl(45, 60%, 20%)"/>
                        <stop offset="100%" stopColor="hsl(45, 80%, 12%)"/>
                      </radialGradient>
                    </defs>
                    <rect width="400" height="400" fill="url(#bg2)"/>
                    <polygon points="200,120 280,200 200,280 120,200" fill="none" stroke="#FFD700" strokeWidth="4" opacity="0.8"/>
                    <polygon points="200,140 260,200 200,260 140,200" fill="none" stroke="#FFED4A" strokeWidth="3" opacity="0.6"/>
                    <circle cx="200" cy="200" r="30" fill="#FFD700" opacity="0.3"/>
                  </svg>
                )}

                {/* Chain Resonance - Mandala with crosshairs */}
                {index === 3 && (
                  <svg width="128" height="128" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1a1a1a' }}>
                    <defs>
                      <radialGradient id="bg3" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="hsl(160, 70%, 22%)"/>
                        <stop offset="100%" stopColor="hsl(160, 90%, 14%)"/>
                      </radialGradient>
                    </defs>
                    <rect width="400" height="400" fill="url(#bg3)"/>
                    <circle cx="200" cy="200" r="120" fill="none" stroke="#00FF88" strokeWidth="5" opacity="0.8"/>
                    <line x1="80" y1="200" x2="320" y2="200" stroke="#00FF88" strokeWidth="3" opacity="0.6"/>
                    <line x1="200" y1="80" x2="200" y2="320" stroke="#20FFAA" strokeWidth="3" opacity="0.6"/>
                    <circle cx="200" cy="200" r="80" fill="none" stroke="#40FFCC" strokeWidth="2" opacity="0.7"/>
                    <circle cx="200" cy="200" r="40" fill="#00FF88" opacity="0.4"/>
                  </svg>
                )}

                {/* Genesis Hash - Fibonacci spirals */}
                {index === 4 && (
                  <svg width="128" height="128" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1a1a1a' }}>
                    <defs>
                      <radialGradient id="bg4" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="hsl(15, 80%, 25%)"/>
                        <stop offset="100%" stopColor="hsl(15, 100%, 16%)"/>
                      </radialGradient>
                    </defs>
                    <rect width="400" height="400" fill="url(#bg4)"/>
                    <circle cx="200" cy="200" r="140" fill="none" stroke="#FF4500" strokeWidth="6" opacity="0.9"/>
                    <circle cx="200" cy="200" r="89" fill="none" stroke="#FFD700" strokeWidth="4" opacity="0.7"/>
                    <circle cx="200" cy="200" r="55" fill="none" stroke="#FF6500" strokeWidth="3" opacity="0.8"/>
                    <circle cx="200" cy="200" r="34" fill="none" stroke="#FFAA00" strokeWidth="2" opacity="0.9"/>
                    <circle cx="200" cy="200" r="21" fill="#FF7700" opacity="0.5"/>
                  </svg>
                )}

                {/* Network Apex - Sacred hexagon */}
                {index === 5 && (
                  <svg width="128" height="128" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1a1a1a' }}>
                    <defs>
                      <radialGradient id="bg5" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="hsl(270, 90%, 28%)"/>
                        <stop offset="100%" stopColor="hsl(270, 100%, 18%)"/>
                      </radialGradient>
                      <filter id="glow5">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <rect width="400" height="400" fill="url(#bg5)"/>
                    <polygon points="200,60 338,140 338,260 200,340 62,260 62,140" fill="none" stroke="#9D00FF" strokeWidth="6" filter="url(#glow5)" opacity="0.9"/>
                    <polygon points="200,100 298,160 298,240 200,300 102,240 102,160" fill="#BD40FF" opacity="0.3"/>
                    <circle cx="200" cy="200" r="60" fill="none" stroke="#DD80FF" strokeWidth="4" opacity="0.8"/>
                    <circle cx="200" cy="200" r="30" fill="#EE99FF" opacity="0.6"/>
                  </svg>
                )}
              </div>
              
              {/* Tier Name */}
              <h3 className="text-lg font-mono font-bold text-white mb-2 text-center">
                {tier.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-300 font-mono mb-3 text-center">
                {tier.description}
              </p>
              
              {/* Physics Explanation */}
              <div className="bg-black/50 p-3 rounded mb-3">
                <p className="text-xs text-gray-400 font-mono">
                  <span className="text-cyan-400">Physics:</span> {tier.physics}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  <span className="text-orange-400">Visual:</span> {tier.visual}
                </p>
              </div>
              
              {/* Rarity Badge */}
              <div className={`flex items-center justify-between text-xs font-mono ${getRarityColor(tier.rarity)}`}>
                <div className="flex items-center space-x-1">
                  {getRarityIcon(tier.rarity)}
                  <span>{tier.rarity.toUpperCase()}</span>
                </div>
                <span className="font-bold">{tier.percentage}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Blockchain Physics Explanation */}
        <div className="border-2 border-cyan-400 bg-black p-8">
          <h3 className="text-2xl font-bold text-cyan-400 mb-6 font-mono text-center">
            WHY ONLY MONAD CAN DO THIS
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400 mb-2 font-mono">HASH ENTROPY</div>
              <div className="text-sm text-gray-300 font-mono mb-2">40% Weight</div>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                <span className="text-cyan-300">Monad's parallel execution</span> processes complex cryptographic calculations in real-time without timeouts
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400 mb-2 font-mono">TEMPORAL SIGNIFICANCE</div>
              <div className="text-sm text-gray-300 font-mono mb-2">30% Weight</div>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                <span className="text-orange-300">1-second block times</span> provide maximum temporal granularity impossible on slower chains
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-2 font-mono">POSITION UNIQUENESS</div>
              <div className="text-sm text-gray-300 font-mono mb-2">30% Weight</div>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                <span className="text-green-300">Ultra-low gas costs</span> make positional minting affordable for everyone, not just whales
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-700">
            <div className="bg-purple-900/30 border border-purple-400 p-6 rounded mb-4">
              <h4 className="text-lg font-bold text-purple-200 mb-3 font-mono">COST COMPARISON:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                <div className="text-red-300">
                  ❌ <span className="font-bold">Ethereum:</span> $50,000+ deployment cost<br/>
                  ❌ 12-second blocks limit temporal precision<br/>
                  ❌ Sequential processing causes timeouts
                </div>
                <div className="text-green-300">
                  ✅ <span className="font-bold">Monad:</span> $5 deployment cost<br/>
                  ✅ 1-second blocks = perfect granularity<br/>
                  ✅ 10,000 TPS handles complex calculations
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10 border border-cyan-400 p-6 rounded mb-6">
                <h4 className="text-2xl font-bold text-cyan-400 mb-4 font-mono">🌍 WORLD'S FIRST BLOCKCHAIN PHYSICS NFT</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-300 mb-1">MATHEMATICAL RARITY</div>
                    <div className="text-gray-400">No social coordination needed - pure cryptographic truth determines rarity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-300 mb-1">BLOCKCHAIN NATIVE</div>
                    <div className="text-gray-400">First NFT using actual blockchain characteristics for visual generation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-300 mb-1">ETERNALLY VERIFIABLE</div>
                    <div className="text-gray-400">100% on-chain - no IPFS, no servers, exists forever on blockchain</div>
                  </div>
                </div>
              </div>
              
              <p className="text-cyan-400 font-mono text-lg font-bold mb-2">
                🚀 MONAD = First blockchain that makes mathematical rarity economically viable
              </p>
              <p className="text-gray-400 font-mono text-sm">
                Revolutionary blockchain physics NFTs: Only possible with Monad's speed, scale, and affordability
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}