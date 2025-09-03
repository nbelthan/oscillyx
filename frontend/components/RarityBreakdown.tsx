'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Zap, Users, Activity, Sparkles } from 'lucide-react';

const RARITY_TIERS = [
  {
    name: 'Network Pulse',
    range: 'Basic blockchain entropy',
    probability: '~34%',
    description: 'Standard cryptographic patterns',
    color: 'text-blue-400',
    bgColor: 'border-blue-400 bg-blue-900/10',
    icon: <Activity className="w-8 h-8" />,
    rarity: 'Common',
    example: 'Clean lines with standard hash distribution patterns'
  },
  {
    name: 'Block Echo',
    range: 'Enhanced entropy patterns',
    probability: '~30%',
    description: 'Meaningful cryptographic resonance',
    color: 'text-green-400',
    bgColor: 'border-green-400 bg-green-900/10',
    icon: <Zap className="w-8 h-8" />,
    rarity: 'Uncommon',
    example: 'Dual harmonics from temporal-hash intersection mathematics'
  },
  {
    name: 'Digital Moment',
    range: 'Significant blockchain markers',
    probability: '~20%',
    description: 'Temporally significant hash patterns',
    color: 'text-yellow-400',
    bgColor: 'border-yellow-400 bg-yellow-900/10',
    icon: <Star className="w-8 h-8" />,
    rarity: 'Rare',
    example: 'Three-factor convergence of entropy, timing, and position'
  },
  {
    name: 'Chain Resonance',
    range: 'Complex blockchain physics',
    probability: '~10%',
    description: 'Multi-dimensional hash complexity',
    color: 'text-orange-400',
    bgColor: 'border-orange-400 bg-orange-900/10',
    icon: <Sparkles className="w-8 h-8" />,
    rarity: 'Epic',
    example: 'Quad-layered cryptographic interference with chaos theory'
  },
  {
    name: 'Network Apex',
    range: 'Exceptional blockchain events',
    probability: '~5%',
    description: 'Legendary cryptographic arrangements',
    color: 'text-purple-400',
    bgColor: 'border-purple-400 bg-purple-900/10',
    icon: <Crown className="w-8 h-8" />,
    rarity: 'Legendary',
    example: 'Perfect entropy alignment with crystalline mathematical structures'
  },
  {
    name: 'Genesis Hash',
    range: 'Mythical blockchain physics',
    probability: '~1%',
    description: 'Perfect cryptographic convergence',
    color: 'text-red-400',
    bgColor: 'border-red-400 bg-red-900/10',
    icon: <Sparkles className="w-8 h-8" />,
    rarity: 'Mythical',
    example: 'Maximum entropy, temporal significance, and position uniqueness'
  }
];

export function RarityBreakdown() {
  return (
    <section className="py-20 border-t-2 border-gray-800 bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 font-mono">
            REVOLUTIONARY BLOCKCHAIN PHYSICS RARITY
          </h2>
          <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto leading-relaxed">
            <span className="text-cyan-400 font-bold">WORLD'S FIRST</span> NFT collection with rarity determined by actual blockchain characteristics.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 font-bold">
              Hash Entropy × Temporal Significance × Position Uniqueness = True Blockchain Rarity
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
              HOW BLOCKCHAIN PHYSICS DETERMINES RARITY
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-white mb-3 font-mono">🔢 HASH ENTROPY (40% WEIGHT)</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  Analyzes block hash for leading zeros, trailing zeros, and repeating patterns. 
                  Pure cryptographic rarity based on mathematical distribution.
                </p>
                
                <h4 className="text-lg font-bold text-white mb-3 font-mono">⏰ TEMPORAL SIGNIFICANCE (30% WEIGHT)</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  Block timestamps create temporal patterns. Certain moments have higher 
                  mathematical significance in blockchain physics.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-3 font-mono">📍 POSITION UNIQUENESS (30% WEIGHT)</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  Block number and token position create unique mathematical fingerprints. 
                  First-ever system to use actual blockchain coordinates for rarity.
                </p>
                
                <h4 className="text-lg font-bold text-white mb-3 font-mono">REVOLUTIONARY APPROACH</h4>
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  No social coordination needed. Pure blockchain physics determines your NFT's rarity. 
                  This is the future of truly decentralized, mathematical rarity.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
              <p className="text-cyan-400 font-mono text-lg font-bold">
                HASH ENTROPY × TEMPORAL SIGNIFICANCE × POSITION UNIQUENESS = BLOCKCHAIN PHYSICS RARITY
              </p>
              <p className="text-gray-400 font-mono text-sm mt-2">
                🌟 World's first NFT collection using actual blockchain characteristics for rarity. No social coordination required.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}