'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Activity, Hash, Clock, Users } from 'lucide-react';
import { createPublicClient, http } from 'viem';

// Monad testnet client
const monadClient = createPublicClient({
  transport: http('https://testnet-rpc.monad.xyz'),
  chain: {
    id: 10143,
    name: 'Monad Testnet',
    network: 'monad-testnet',
    nativeCurrency: { decimals: 18, name: 'MON', symbol: 'MON' },
    rpcUrls: { 
      default: { http: ['https://testnet-rpc.monad.xyz'] },
      public: { http: ['https://testnet-rpc.monad.xyz'] }
    },
    blockExplorers: {
      default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }
    }
  }
});

interface BlockData {
  number: bigint;
  hash: string;
  timestamp: bigint;
  gasUsed: bigint;
  gasLimit: bigint;
  transactions: string[];
}

interface GeneratedPunk {
  blockNumber: string;
  blockHash: string;
  timestamp: number;
  cohortSize: number;
  densityTier: string;
  stylePackId: number;
  stylePack: string;
  palette: { name: string; start: string; end: string; rarity: string; };
  svgData: string;
  rarity: string;
  densityRarity?: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

// Color palettes for demonstration
const COLOR_PALETTES = [
  { name: 'Electric Blue', start: '#00D4FF', end: '#0066FF', rarity: 'Common' },
  { name: 'Plasma Purple', start: '#FF00FF', end: '#7B00FF', rarity: 'Common' },
  { name: 'Golden Hour', start: '#FFD700', end: '#FFA500', rarity: 'Rare' },
  { name: 'Quantum Violet', start: '#9D00FF', end: '#4B0082', rarity: 'Rare' },
  { name: 'Fire Opal', start: '#FF3300', end: '#FFCC00', rarity: 'Epic' },
  { name: 'Holographic', start: '#00FFFF', end: '#FF00FF', rarity: 'Legendary' }
];

const DENSITY_TIERS = [
  { name: 'Solo', range: '1', rarity: 'Common', color: 'text-blue-400' },
  { name: 'Pair', range: '2', rarity: 'Uncommon', color: 'text-green-400' },
  { name: 'Trio', range: '3', rarity: 'Rare', color: 'text-yellow-400' },
  { name: 'Quartet', range: '4-7', rarity: 'Epic', color: 'text-orange-400' },
  { name: 'Octet', range: '8-15', rarity: 'Legendary', color: 'text-purple-400' },
  { name: 'Surge', range: '16+', rarity: 'Mythical', color: 'text-red-400' },
];

function generateLissajous(seed: string, width: number = 200, height: number = 200): string {
  // Convert seed to numeric values
  const seedBytes = Array.from(seed.slice(2, 34)).map((_, i) => parseInt(seed.slice(2 + i * 2, 4 + i * 2), 16));
  
  const a = (seedBytes[0] % 7) + 1;
  const b = (seedBytes[1] % 7) + 1;
  const delta = (seedBytes[2] / 255) * Math.PI * 2;
  const scale = 0.8;
  
  let path = '';
  const points = 200;
  
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2;
    const x = width/2 + (width/2 * scale) * Math.sin(a * t + delta);
    const y = height/2 + (height/2 * scale) * Math.sin(b * t);
    
    if (i === 0) {
      path += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  
  return path;
}

function generateOscillyxSVG(blockData: BlockData, cohortSize: number, tokenId: number, palette: any): string {
  // Use same pattern for all, just change colors
  // Use a fixed seed for consistent pattern
  const fixedSeed = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  
  // Generate the SAME Lissajous curve for all
  const curvePath = generateLissajous(fixedSeed);
  
  // Background pattern based on cohort size
  const patternOpacity = Math.min(cohortSize / 20, 0.8);
  
  // Add special effects for rare palettes
  const isLegendary = palette.rarity === 'Legendary';
  const isEpic = palette.rarity === 'Epic';
  const isRare = palette.rarity === 'Rare';
  
  return `
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <defs>
        <linearGradient id="grad-${tokenId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.start}" />
          <stop offset="100%" style="stop-color:${palette.end}" />
        </linearGradient>
        <filter id="glow-${tokenId}">
          <feGaussianBlur stdDeviation="${isLegendary ? 5 : isEpic ? 4 : 3}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        ${isLegendary ? `
        <animate attributeName="stroke" values="${palette.start};${palette.end};${palette.start}" dur="3s" repeatCount="indefinite"/>
        ` : ''}
      </defs>
      
      <!-- Background -->
      <rect width="200" height="200" fill="#0a0a0a"/>
      
      <!-- Pattern overlay for depth -->
      <rect width="200" height="200" fill="url(#grad-${tokenId})" opacity="${0.1 + patternOpacity * 0.2}"/>
      
      <!-- Ghost strands for cohort density -->
      ${cohortSize > 3 ? `
      <path d="${curvePath}" 
            fill="none" 
            stroke="url(#grad-${tokenId})"
            stroke-width="1" 
            opacity="0.2"
            transform="translate(5,5)"/>
      ` : ''}
      ${cohortSize > 8 ? `
      <path d="${curvePath}" 
            fill="none" 
            stroke="url(#grad-${tokenId})"
            stroke-width="1.5" 
            opacity="0.15"
            transform="translate(-3,3)"/>
      ` : ''}
      
      <!-- Main Lissajous curve with glow -->
      <path d="${curvePath}" 
            fill="none" 
            stroke="url(#grad-${tokenId})"
            stroke-width="${cohortSize > 10 ? 4 : 3}" 
            filter="url(#glow-${tokenId})"
            opacity="${isLegendary ? 0.95 : 0.9}"/>
      
      <!-- Core curve -->
      <path d="${curvePath}" 
            fill="none" 
            stroke="url(#grad-${tokenId})"
            stroke-width="2" 
            opacity="1"/>
      
      ${isLegendary ? `
      <!-- Legendary shimmer effect -->
      <path d="${curvePath}" 
            fill="none" 
            stroke="white"
            stroke-width="1" 
            opacity="0.3">
        <animate attributeName="opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite"/>
      </path>
      ` : ''}
      
      <!-- Palette name -->
      <text x="10" y="190" 
            font-family="monospace" 
            font-size="8" 
            fill="${palette.start}"
            opacity="0.8">
        ${palette.name}
      </text>
    </svg>
  `.trim();
}

function getDensityTier(cohortSize: number) {
  if (cohortSize === 1) return DENSITY_TIERS[0];
  if (cohortSize === 2) return DENSITY_TIERS[1];
  if (cohortSize === 3) return DENSITY_TIERS[2];
  if (cohortSize >= 4 && cohortSize <= 7) return DENSITY_TIERS[3];
  if (cohortSize >= 8 && cohortSize <= 15) return DENSITY_TIERS[4];
  return DENSITY_TIERS[5];
}

export function OscillyxGallery() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [generatedPunks, setGeneratedPunks] = useState<GeneratedPunk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentBlocks() {
      try {
        setLoading(true);
        
        // Get latest block number
        const latestBlock = await monadClient.getBlockNumber();
        
        // Fetch last 6 blocks with full transaction data
        const blockPromises = [];
        for (let i = 0; i < 6; i++) {
          const blockNumber = latestBlock - BigInt(i);
          blockPromises.push(
            monadClient.getBlock({ 
              blockNumber, 
              includeTransactions: true 
            }).catch(err => {
              console.warn(`Failed to fetch block ${blockNumber}:`, err);
              return null;
            })
          );
        }
        
        const fetchedBlocks = await Promise.all(blockPromises);
        const validBlocks = fetchedBlocks.filter(block => block !== null) as any[];
        
        // Generate variations with different color palettes
        const variations = validBlocks.map((block, index) => {
          const cohortSize = Math.max(1, block.transactions.length);
          const densityTier = getDensityTier(cohortSize);
          
          // Select palette based on index for demonstration
          const palette = COLOR_PALETTES[index % COLOR_PALETTES.length];
          
          const svgData = generateOscillyxSVG(block, cohortSize, index, palette);
          
          const attributes = [
            { trait_type: 'Block Number', value: block.number.toString() },
            { trait_type: 'Color Palette', value: palette.name },
            { trait_type: 'Palette Rarity', value: palette.rarity },
            { trait_type: 'Density Tier', value: densityTier.name },
            { trait_type: 'Cohort Size', value: cohortSize.toString() },
            { trait_type: 'Combined Rarity', value: `${palette.rarity} × ${densityTier.rarity}` }
          ];
          
          return {
            blockNumber: block.number.toString(),
            blockHash: block.hash,
            timestamp: Number(block.timestamp),
            cohortSize,
            densityTier: densityTier.name,
            stylePackId: index % COLOR_PALETTES.length,
            stylePack: palette.name,
            palette,
            svgData,
            rarity: palette.rarity,
            densityRarity: densityTier.rarity,
            attributes
          };
        });
        
        setBlocks(validBlocks);
        setGeneratedPunks(variations);
        
      } catch (error) {
        console.error('Error fetching blocks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentBlocks();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3 text-cyan-400 font-mono">
          <Activity className="w-6 h-6 animate-spin" />
          <span>FETCHING LIVE MONAD BLOCKS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 font-mono">
          COLOR VARIATIONS IN ACTION
        </h3>
        <p className="text-gray-400 font-mono text-sm">
          Same high-quality pattern • Different color palettes • Every one unique
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {generatedPunks.map((punk, index) => (
          <motion.div
            key={punk.blockHash}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-gray-700 hover:border-cyan-400 bg-black p-4 transition-all group max-w-sm mx-auto"
          >
            {/* NFT Image */}
            <div className="nft-container mb-4">
              <div 
                dangerouslySetInnerHTML={{ __html: punk.svgData }}
                className="w-full h-full"
              />
              
              {/* Rarity Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-mono font-bold ${
                punk.rarity === 'Legendary' ? 'text-yellow-400 border-yellow-400' :
                punk.rarity === 'Epic' ? 'text-purple-400 border-purple-400' :
                punk.rarity === 'Rare' ? 'text-blue-400 border-blue-400' :
                'text-gray-400 border-gray-400'
              } bg-black/90 border`}>
                {punk.palette.rarity.toUpperCase()}
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-mono font-bold">
                  OSCILLYX #{punk.blockNumber}
                </h4>
                <a
                  href={`https://testnet.monadexplorer.com/block/${punk.blockNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Key Attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-gray-900 p-2 border border-gray-700">
                  <div className="text-gray-400">PALETTE</div>
                  <div className="font-bold" style={{ color: punk.palette.start }}>
                    {punk.palette.name}
                  </div>
                </div>
                <div className="bg-gray-900 p-2 border border-gray-700">
                  <div className="text-gray-400">DENSITY</div>
                  <div className={`font-bold ${getDensityTier(punk.cohortSize).color}`}>
                    {punk.densityTier}
                  </div>
                </div>
              </div>

              {/* Block Info */}
              <div className="pt-2 border-t border-gray-700 space-y-1 text-xs font-mono text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Hash className="w-3 h-3 mr-1" />
                    BLOCK
                  </span>
                  <span className="text-cyan-400">#{punk.blockNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    COHORT
                  </span>
                  <span className="text-white">{punk.cohortSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    TIME
                  </span>
                  <span className="text-gray-300">
                    {new Date(punk.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Block Hash (truncated) */}
              <div className="text-xs font-mono text-gray-500 truncate" title={punk.blockHash}>
                {punk.blockHash.slice(0, 10)}...{punk.blockHash.slice(-8)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-8 border-t border-gray-800">
        <p className="text-gray-400 font-mono text-sm mb-4">
          Same pattern • Different colors • 10,000 unique variations
        </p>
        <a
          href="https://testnet.monadexplorer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-mono text-sm transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          VIEW MORE BLOCKS ON MONAD EXPLORER
        </a>
      </div>
    </div>
  );
}