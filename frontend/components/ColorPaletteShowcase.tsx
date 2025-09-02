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
            <span className="text-cyan-400 font-bold">WORLD'S FIRST</span> NFT collection with rarity determined by actual blockchain characteristics.
            <br />
            <span className="text-orange-400">Hash Entropy × Temporal Significance × Position Uniqueness = Mathematical Rarity</span>
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
              {/* Visual Preview Circle */}
              <div 
                className="h-32 w-32 rounded-full mx-auto mb-4 relative overflow-hidden border-4"
                style={{
                  backgroundColor: tier.color,
                  borderColor: tier.color,
                  opacity: 0.8
                }}
              >
                <div className="absolute inset-4 rounded-full border-2 border-white/50"></div>
                {tier.rarity === 'Mythical' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
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
            REVOLUTIONARY BLOCKCHAIN PHYSICS RARITY
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400 mb-2 font-mono">HASH ENTROPY</div>
              <div className="text-sm text-gray-300 font-mono mb-2">40% Weight</div>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                Cryptographic randomness from the blockchain seed determines base visual complexity
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400 mb-2 font-mono">TEMPORAL SIGNIFICANCE</div>
              <div className="text-sm text-gray-300 font-mono mb-2">30% Weight</div>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                Block timing patterns create temporal rarity based on network activity
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-2 font-mono">POSITION UNIQUENESS</div>
              <div className="text-sm text-gray-300 font-mono mb-2">30% Weight</div>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                Mint position within block creates positional rarity for early minters
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-700 text-center">
            <p className="text-cyan-400 font-mono text-lg font-bold mb-2">
              🧮 MATHEMATICAL RARITY = (Hash Entropy × 40%) + (Temporal × 30%) + (Position × 30%)
            </p>
            <p className="text-gray-400 font-mono text-sm">
              100% cryptographically verifiable • No human coordination required • Pure blockchain physics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}