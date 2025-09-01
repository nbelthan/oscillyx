'use client';

import { useState, useEffect } from 'react';
import { useContractRead, useBlockNumber } from 'wagmi';
import { motion } from 'framer-motion';
import { Activity, Users, Zap, TrendingUp } from 'lucide-react';
import { BLOCKWEAVE_ABI, CONTRACT_ADDRESS } from '@/lib/contract';

interface CohortData {
  blockNo: number;
  count: number;
  densityTier: string;
  color: string;
  timestamp: number;
}

const DENSITY_TIERS = {
  0: { name: 'Empty', color: 'gray', icon: '⚫' },
  1: { name: 'Solo', color: 'blue', icon: '🔵' },
  2: { name: 'Pair', color: 'green', icon: '🟢' },
  3: { name: 'Trio', color: 'yellow', icon: '🟡' },
  4: { name: 'Quartet', color: 'orange', icon: '🟠' },
  8: { name: 'Octet', color: 'purple', icon: '🟣' },
  16: { name: 'Surge', color: 'red', icon: '🔴' },
};

function getDensityTier(count: number) {
  if (count === 0) return DENSITY_TIERS[0];
  if (count === 1) return DENSITY_TIERS[1];
  if (count === 2) return DENSITY_TIERS[2];
  if (count === 3) return DENSITY_TIERS[3];
  if (count >= 4 && count < 8) return DENSITY_TIERS[4];
  if (count >= 8 && count < 16) return DENSITY_TIERS[8];
  return DENSITY_TIERS[16];
}

export function CohortMeter() {
  const [cohortHistory, setCohortHistory] = useState<CohortData[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number>(0);

  // Get current block number
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    onBlock: (blockNumber) => {
      setCurrentBlock(Number(blockNumber));
    },
  });

  // Get block count for current block
  const { data: currentBlockCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BLOCKWEAVE_ABI,
    functionName: 'blockCount',
    args: [currentBlock],
    enabled: currentBlock > 0,
    watch: true,
  });

  // Update cohort history when new data comes in
  useEffect(() => {
    if (currentBlock && currentBlockCount !== undefined) {
      const count = Number(currentBlockCount);
      const tier = getDensityTier(count);
      
      const newCohortData: CohortData = {
        blockNo: currentBlock,
        count,
        densityTier: tier.name,
        color: tier.color,
        timestamp: Date.now(),
      };

      setCohortHistory(prev => {
        const filtered = prev.filter(item => item.blockNo !== currentBlock);
        const updated = [...filtered, newCohortData];
        return updated.slice(-20); // Keep only last 20 blocks
      });
    }
  }, [currentBlock, currentBlockCount]);

  const currentCohort = cohortHistory[cohortHistory.length - 1];
  const averageCohortSize = cohortHistory.length > 0 
    ? cohortHistory.reduce((sum, item) => sum + item.count, 0) / cohortHistory.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Live Cohort Meter</h2>
        <p className="text-gray-400">
          Real-time tracking of minting activity across blocks
        </p>
      </div>

      {/* Current Cohort Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <Activity className="w-8 h-8 text-neon-500 mr-2" />
            <h3 className="text-xl font-semibold text-white">Current Block</h3>
          </div>
          <p className="text-3xl font-bold neon-text">#{currentBlock.toLocaleString()}</p>
          {currentCohort && (
            <div className="mt-2 flex items-center justify-center">
              <span className="text-2xl mr-2">{getDensityTier(currentCohort.count).icon}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${currentCohort.color}-900/20 text-${currentCohort.color}-300 border border-${currentCohort.color}-500/30`}>
                {currentCohort.densityTier}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <Users className="w-8 h-8 text-purple-500 mr-2" />
            <h3 className="text-xl font-semibold text-white">Current Cohort</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {currentCohort ? currentCohort.count : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Mints in this block</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <TrendingUp className="w-8 h-8 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold text-white">Average Cohort</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {averageCohortSize.toFixed(1)}
          </p>
          <p className="text-sm text-gray-400 mt-1">Last 20 blocks</p>
        </motion.div>
      </div>

      {/* Block History Visualization */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Zap className="w-6 h-6 text-neon-500 mr-2" />
            Block Cohort History
          </h3>
          <p className="text-sm text-gray-400">Last 20 blocks</p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {cohortHistory.slice().reverse().map((cohort, index) => {
            const tier = getDensityTier(cohort.count);
            const isRecent = index < 3;
            
            return (
              <motion.div
                key={cohort.blockNo}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isRecent 
                    ? 'bg-neon-900/20 border border-neon-500/30' 
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{tier.icon}</span>
                  <div>
                    <p className="text-white font-medium">Block #{cohort.blockNo.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cohort.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-white font-bold">{cohort.count}</p>
                    <p className="text-xs text-gray-400">mints</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-${cohort.color}-900/20 text-${cohort.color}-300`}>
                    {cohort.densityTier}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {cohortHistory.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Waiting for block data...</p>
            <p className="text-xs mt-1">Connect your wallet to start tracking</p>
          </div>
        )}
      </div>

      {/* Density Legend */}
      <div className="card">
        <h4 className="text-lg font-semibold text-white mb-3">Density Tiers</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.values(DENSITY_TIERS).map((tier) => (
            <div key={tier.name} className="flex flex-col items-center p-2 bg-gray-800/50 rounded-lg">
              <span className="text-2xl mb-1">{tier.icon}</span>
              <span className={`text-xs font-medium text-${tier.color}-300`}>
                {tier.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Each tier represents the number of NFTs minted within the same block
        </p>
      </div>
    </div>
  );
}