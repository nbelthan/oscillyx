'use client';

import { motion } from 'framer-motion';
import { Sparkles, Star, Zap, Crown } from 'lucide-react';

const COLOR_PALETTES = [
  { name: 'Neon Flame', start: '#FF6A00', end: '#FFD966', rarity: 'Common' },
  { name: 'Electric Blue', start: '#00D4FF', end: '#0066FF', rarity: 'Common' },
  { name: 'Plasma Purple', start: '#FF00FF', end: '#7B00FF', rarity: 'Common' },
  { name: 'Toxic Green', start: '#00FF00', end: '#66FF00', rarity: 'Common' },
  { name: 'Ruby Red', start: '#FF0040', end: '#FF6666', rarity: 'Common' },
  { name: 'Golden Hour', start: '#FFD700', end: '#FFA500', rarity: 'Rare' },
  { name: 'Silver Chrome', start: '#E6E6E6', end: '#FFFFFF', rarity: 'Rare' },
  { name: 'Rose Gold', start: '#FFB6C1', end: '#FFC0CB', rarity: 'Rare' },
  { name: 'Copper Wire', start: '#B87333', end: '#FF8C42', rarity: 'Common' },
  { name: 'Deep Ocean', start: '#003366', end: '#0099CC', rarity: 'Common' },
  { name: 'Emerald Glow', start: '#00FF88', end: '#00CC66', rarity: 'Common' },
  { name: 'Sunset Blaze', start: '#FF4500', end: '#FF8C00', rarity: 'Common' },
  { name: 'Aurora', start: '#00FFCC', end: '#FF00FF', rarity: 'Epic' },
  { name: 'Vapor Wave', start: '#FF6EC7', end: '#00FFFF', rarity: 'Epic' },
  { name: 'Matrix Green', start: '#00FF41', end: '#008F11', rarity: 'Common' },
  { name: 'Quantum Violet', start: '#9D00FF', end: '#4B0082', rarity: 'Rare' },
  { name: 'Neon Pink', start: '#FF1493', end: '#FF69B4', rarity: 'Common' },
  { name: 'Holographic', start: '#00FFFF', end: '#FF00FF', rarity: 'Legendary' },
  { name: 'Fire Opal', start: '#FF3300', end: '#FFCC00', rarity: 'Epic' },
  { name: 'Ice Crystal', start: '#B0E0E6', end: '#E0FFFF', rarity: 'Rare' }
];

function getRarityIcon(rarity: string) {
  switch(rarity) {
    case 'Legendary': return <Crown className="w-4 h-4" />;
    case 'Epic': return <Zap className="w-4 h-4" />;
    case 'Rare': return <Star className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
}

function getRarityColor(rarity: string) {
  switch(rarity) {
    case 'Legendary': return 'text-yellow-400 border-yellow-400';
    case 'Epic': return 'text-purple-400 border-purple-400';
    case 'Rare': return 'text-blue-400 border-blue-400';
    default: return 'text-gray-400 border-gray-600';
  }
}

export function ColorPaletteShowcase() {
  return (
    <section className="py-20 border-t-2 border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 font-mono">
            20 DISTINCT COLOR PALETTES
          </h2>
          <p className="text-xl text-gray-300 font-mono max-w-4xl mx-auto leading-relaxed">
            Every Oscillyx NFT uses one of these palettes, determined by block hash.
            <br />
            <span className="text-cyan-400">Same art, different colors = 10,000 unique pieces</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {COLOR_PALETTES.map((palette, index) => (
            <motion.div
              key={palette.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`border bg-gray-900/50 p-4 hover:scale-105 transition-all duration-300 ${
                palette.rarity === 'Legendary' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' :
                palette.rarity === 'Epic' ? 'border-purple-400 shadow-lg shadow-purple-400/20' :
                palette.rarity === 'Rare' ? 'border-blue-400 shadow-lg shadow-blue-400/20' :
                'border-gray-700'
              }`}
            >
              {/* Gradient Preview */}
              <div 
                className="h-24 rounded mb-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${palette.start}, ${palette.end})`
                }}
              >
                {palette.rarity === 'Legendary' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                )}
              </div>
              
              {/* Palette Name */}
              <h3 className="text-sm font-mono font-bold text-white mb-2">
                {palette.name}
              </h3>
              
              {/* Rarity Badge */}
              <div className={`flex items-center space-x-1 text-xs font-mono ${getRarityColor(palette.rarity)}`}>
                {getRarityIcon(palette.rarity)}
                <span>{palette.rarity.toUpperCase()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rarity Distribution */}
        <div className="border-2 border-cyan-400 bg-black p-8">
          <h3 className="text-2xl font-bold text-cyan-400 mb-6 font-mono text-center">
            PALETTE RARITY DISTRIBUTION
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400 mb-2 font-mono">93.8%</div>
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <Sparkles className="w-5 h-5" />
                <span className="font-mono text-sm">COMMON</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">Standard palettes</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2 font-mono">5.9%</div>
              <div className="flex items-center justify-center space-x-2 text-blue-400">
                <Star className="w-5 h-5" />
                <span className="font-mono text-sm">RARE</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">Silver tint overlay</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2 font-mono">0.37%</div>
              <div className="flex items-center justify-center space-x-2 text-purple-400">
                <Zap className="w-5 h-5" />
                <span className="font-mono text-sm">EPIC</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">Golden shimmer</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2 font-mono">0.02%</div>
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <Crown className="w-5 h-5" />
                <span className="font-mono text-sm">LEGENDARY</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">Animated rainbow</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-cyan-400 font-mono text-lg font-bold">
              BLOCK HASH → PALETTE SELECTION → YOUR UNIQUE COLORS
            </p>
            <p className="text-gray-400 font-mono text-sm mt-2">
              Combined with cohort density for two-layer rarity system
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}