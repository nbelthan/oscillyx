'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Zap, Users, Activity, Sparkles } from 'lucide-react';

const RARITY_TIERS = [
  {
    name: 'Solo',
    range: '1 mint per block',
    probability: '~40%',
    description: 'Individual expression, clean lines',
    color: 'text-blue-400',
    bgColor: 'border-blue-400 bg-blue-900/10',
    icon: <Users className="w-8 h-8" />,
    rarity: 'Common',
    example: 'Clean geometric patterns with single-focus algorithms'
  },
  {
    name: 'Pair',
    range: '2 mints per block',
    probability: '~25%',
    description: 'Complementary dual harmonics',
    color: 'text-green-400',
    bgColor: 'border-green-400 bg-green-900/10',
    icon: <Activity className="w-8 h-8" />,
    rarity: 'Uncommon',
    example: 'Synchronized curves with dual-resonance mathematics'
  },
  {
    name: 'Trio',
    range: '3 mints per block',
    probability: '~15%',
    description: 'Triangular balance, sacred geometry',
    color: 'text-yellow-400',
    bgColor: 'border-yellow-400 bg-yellow-900/10',
    icon: <Star className="w-8 h-8" />,
    rarity: 'Rare',
    example: 'Triple-phase oscillations with golden ratio influences'
  },
  {
    name: 'Quartet',
    range: '4-7 mints per block',
    probability: '~12%',
    description: 'Complex multi-layered compositions',
    color: 'text-orange-400',
    bgColor: 'border-orange-400 bg-orange-900/10',
    icon: <Zap className="w-8 h-8" />,
    rarity: 'Epic',
    example: 'Quad-harmonic interference patterns with chaos theory'
  },
  {
    name: 'Octet',
    range: '8-15 mints per block',
    probability: '~6%',
    description: 'Dense collaborative energy fields',
    color: 'text-purple-400',
    bgColor: 'border-purple-400 bg-purple-900/10',
    icon: <Sparkles className="w-8 h-8" />,
    rarity: 'Legendary',
    example: 'Eight-fold symmetries with crystalline mathematical structures'
  },
  {
    name: 'Surge',
    range: '16+ mints per block',
    probability: '~2%',
    description: 'Mythical mass-consensus events',
    color: 'text-red-400',
    bgColor: 'border-red-400 bg-red-900/10',
    icon: <Crown className="w-8 h-8" />,
    rarity: 'Mythical',
    example: 'Hyperchaotic systems with emergent complexity beyond prediction'
  }
];

export function RarityBreakdown() {
  return (
    <section className="py-20 border-t-2 border-gray-800 bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 font-mono">
            TWO-LAYER RARITY SYSTEM
          </h2>
          <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto leading-relaxed">
            Each Oscillyx NFT has two rarity factors that combine for ultimate uniqueness.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 font-bold">
              Color Palette Rarity × Cohort Density = Total Rarity
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {RARITY_TIERS.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${tier.bgColor} border-2 p-6 hover:scale-105 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${tier.color}`}>
                  {tier.icon}
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono font-bold ${tier.color}`}>
                    {tier.rarity.toUpperCase()}
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    {tier.probability}
                  </div>
                </div>
              </div>

              <h3 className={`text-2xl font-bold mb-2 font-mono ${tier.color}`}>
                {tier.name.toUpperCase()}
              </h3>

              <p className="text-gray-300 font-mono text-sm mb-4">
                {tier.range}
              </p>

              <p className="text-white font-mono text-sm mb-4 leading-relaxed">
                {tier.description}
              </p>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                  <span className="text-cyan-400 font-bold">MATH:</span> {tier.example}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Probability Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="border-2 border-cyan-400 bg-black p-8">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6 font-mono text-center">
              HOW RARITY LAYERS WORK TOGETHER
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-white mb-3 font-mono">COLOR PALETTE LAYER</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  Block hash determines your palette from 20 options. Legendary palettes (0.02%) 
                  feature animated rainbow gradients and special effects.
                </p>
                
                <h4 className="text-lg font-bold text-white mb-3 font-mono">DENSITY TIER LAYER</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  Cohort size determines ghost strands and visual complexity. 
                  Solo mints are clean, Surges create dense multi-layered compositions.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-3 font-mono">COMBINED RARITY</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  A Legendary palette (0.02%) in a Surge event (2%) creates a 0.0004% chance - 
                  only 4 in 1,000,000 NFTs achieve this combination.
                </p>
                
                <h4 className="text-lg font-bold text-white mb-3 font-mono">PERMANENT RECORD</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  Every NFT contains its birth block metadata forever. You can trace back to the exact 
                  moment of consensus that created your unique pattern.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
              <p className="text-cyan-400 font-mono text-lg font-bold">
                BLOCK HASH → COLOR PALETTE × COHORT SIZE → UNIQUE RARITY
              </p>
              <p className="text-gray-400 font-mono text-sm mt-2">
                Same pattern, infinite variations. 100% on-chain determination.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}