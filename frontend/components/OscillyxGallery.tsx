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

// Blockchain Physics Rarity Tiers - matching our smart contract exactly
const BLOCKCHAIN_PHYSICS_TIERS = [
  { name: 'Network Pulse', color: '#00D4FF', rarity: 'Common', percentage: '45-55%' },
  { name: 'Block Echo', color: '#FF6EC7', rarity: 'Common', percentage: '25-35%' },
  { name: 'Digital Moment', color: '#FFD700', rarity: 'Rare', percentage: '10-15%' },
  { name: 'Chain Resonance', color: '#00FF88', rarity: 'Epic', percentage: '3-7%' },
  { name: 'Genesis Hash', color: '#FF4500', rarity: 'Legendary', percentage: '1-2%' },
  { name: 'Network Apex', color: '#9D00FF', rarity: 'Mythical', percentage: '<1%' }
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

// Generate SVG exactly like our smart contract does
function generateBlockchainPhysicsSVG(rarity: number, seed: number, tierName: string, tierColor: string): string {
  const radius = 60 + (rarity * 20);
  const hue1 = seed % 360;
  const hue2 = (seed >> 8) % 360;
  const strokeWidth = 2 + rarity;
  
  return `
    <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="display: block; background: #1a1a1a;">
      <!-- Background -->
      <rect width="400" height="400" fill="hsl(${hue1}, 50%, 20%)"/>
      
      <!-- Main circle - matches contract exactly -->
      <circle cx="200" cy="200" r="${radius}" 
              fill="none" 
              stroke="hsl(${hue2}, 70%, 60%)" 
              stroke-width="${strokeWidth}"/>
      
      <!-- Tier name at bottom -->
      <text x="200" y="350" 
            text-anchor="middle" 
            fill="white" 
            font-family="monospace" 
            font-size="16">
        ${tierName}
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
        
        // Generate blockchain physics NFTs like our smart contract
        const variations = validBlocks.map((block, index) => {
          // Calculate blockchain physics rarity exactly like contract
          const seed = parseInt(block.hash.slice(2, 18), 16);
          const hashEntropy = (seed % 100);
          const temporalSig = (Number(block.number) % 100);
          const positionUniq = (index % 100);
          
          const total = (hashEntropy * 2) + temporalSig + positionUniq;
          
          let rarityLevel = 0;
          if (total >= 400) rarityLevel = 5;
          else if (total >= 350) rarityLevel = 4;
          else if (total >= 300) rarityLevel = 3;
          else if (total >= 200) rarityLevel = 2;
          else if (total >= 100) rarityLevel = 1;
          
          // Get corresponding tier
          const tier = BLOCKCHAIN_PHYSICS_TIERS[rarityLevel] || BLOCKCHAIN_PHYSICS_TIERS[0];
          
          const svgData = generateBlockchainPhysicsSVG(rarityLevel, seed, tier.name, tier.color);
          
          const attributes = [
            { trait_type: 'Rarity Tier', value: tier.name },
            { trait_type: 'Rarity Level', value: tier.rarity },
            { trait_type: 'Block Number', value: block.number.toString() },
            { trait_type: 'Hash Entropy', value: hashEntropy.toString() },
            { trait_type: 'Physics Score', value: total.toString() }
          ];
          
          return {
            blockNumber: block.number.toString(),
            blockHash: block.hash,
            timestamp: Number(block.timestamp),
            cohortSize: 1, // Not relevant for blockchain physics
            densityTier: tier.name,
            stylePackId: rarityLevel,
            stylePack: tier.name,
            palette: { name: tier.name, start: tier.color, end: tier.color, rarity: tier.rarity },
            svgData,
            rarity: tier.rarity,
            densityRarity: tier.rarity,
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
          🚀 BLOCKCHAIN PHYSICS RARITY IN ACTION
        </h3>
        <p className="text-gray-400 font-mono text-sm">
          Live Monad blocks • Mathematical rarity calculation • 100% on-chain generation
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
                  <div className="text-gray-400">RARITY TIER</div>
                  <div className="font-bold" style={{ color: punk.palette.start }}>
                    {punk.palette.name}
                  </div>
                </div>
                <div className="bg-gray-900 p-2 border border-gray-700">
                  <div className="text-gray-400">PHYSICS LEVEL</div>
                  <div className="font-bold text-white">
                    {punk.rarity}
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
                    <Activity className="w-3 h-3 mr-1" />
                    PHYSICS SCORE
                  </span>
                  <span className="text-cyan-400">{punk.attributes[4]?.value || 'N/A'}</span>
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
          Pure blockchain physics • Mathematical rarity • 10,000 unique combinations
        </p>
        <a
          href="https://testnet.monadexplorer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-mono text-sm transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          VIEW MORE MONAD BLOCKS FOR BLOCKCHAIN PHYSICS
        </a>
      </div>
    </div>
  );
}