'use client';

import { useContractRead } from 'wagmi';
import { motion } from 'framer-motion';
import { Activity, Users, Zap, Trophy, Layers, Palette } from 'lucide-react';
import { OSCILLYX_ABI, CONTRACT_ADDRESS } from '@/lib/contract';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  delay?: number;
  gradient?: boolean;
}

function StatCard({ title, value, subtitle, icon, delay = 0, gradient = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`${gradient ? 'card-highlight' : 'card'} text-center hover:scale-105 transition-transform`}
    >
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className={`text-3xl font-bold mb-1 ${gradient ? 'gradient-text' : 'neon-text'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </motion.div>
  );
}

export function StatsGrid() {
  // Contract reads for various stats
  const { data: totalSupply } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: OSCILLYX_ABI,
    functionName: 'totalSupply',
    watch: true,
  });

  const { data: maxSupply } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: OSCILLYX_ABI,
    functionName: 'MAX_SUPPLY',
  });

  const { data: mintingActive } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: OSCILLYX_ABI,
    functionName: 'mintingActive',
    watch: true,
  });

  const { data: posterCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: OSCILLYX_ABI,
    functionName: 'posterCount',
    watch: true,
  });

  // Calculate derived stats
  const totalMinted = Number(totalSupply || 0);
  const maxTotal = Number(maxSupply || 10000);
  const mintProgress = (totalMinted / maxTotal) * 100;
  const remainingSupply = maxTotal - totalMinted;
  const totalPosters = Number(posterCount || 0);

  // Mock stats for density distribution (in a real app, you'd read this from contract events)
  const mockDensityStats = {
    solo: Math.floor(totalMinted * 0.4),
    pair: Math.floor(totalMinted * 0.25),
    trio: Math.floor(totalMinted * 0.15),
    quartet: Math.floor(totalMinted * 0.1),
    octet: Math.floor(totalMinted * 0.08),
    surge: Math.floor(totalMinted * 0.02),
  };

  return (
    <section className="py-20 bg-black/20 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold gradient-text mb-4"
          >
            Collection Statistics
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Live metrics from the Oscillyx ecosystem
          </motion.p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Minted"
            value={totalMinted}
            subtitle={`${mintProgress.toFixed(1)}% of supply`}
            icon={<Users className="w-8 h-8 text-neon-500" />}
            delay={0}
            gradient={true}
          />
          
          <StatCard
            title="Remaining Supply"
            value={remainingSupply}
            subtitle={`Out of ${maxTotal.toLocaleString()}`}
            icon={<Layers className="w-8 h-8 text-purple-500" />}
            delay={0.1}
          />
          
          <StatCard
            title="Poster Collection"
            value={totalPosters}
            subtitle="Commemorative pieces"
            icon={<Trophy className="w-8 h-8 text-yellow-500" />}
            delay={0.2}
          />
          
          <StatCard
            title="Minting Status"
            value={mintingActive ? "LIVE" : "PAUSED"}
            subtitle={mintingActive ? "Ready to mint" : "Currently disabled"}
            icon={<Activity className="w-8 h-8 text-green-500" />}
            delay={0.3}
          />
        </div>

        {/* Density Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <Zap className="w-6 h-6 text-neon-500 mr-2" />
              Density Tier Distribution
            </h3>
            <p className="text-gray-400">How NFTs are distributed across cohort sizes</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-2xl mb-2">🔵</div>
              <div className="text-blue-300 font-semibold">Solo</div>
              <div className="text-2xl font-bold text-white">{mockDensityStats.solo}</div>
              <div className="text-xs text-gray-400">Single mints</div>
            </div>

            <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-2xl mb-2">🟢</div>
              <div className="text-green-300 font-semibold">Pair</div>
              <div className="text-2xl font-bold text-white">{mockDensityStats.pair}</div>
              <div className="text-xs text-gray-400">2 per block</div>
            </div>

            <div className="text-center p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="text-2xl mb-2">🟡</div>
              <div className="text-yellow-300 font-semibold">Trio</div>
              <div className="text-2xl font-bold text-white">{mockDensityStats.trio}</div>
              <div className="text-xs text-gray-400">3 per block</div>
            </div>

            <div className="text-center p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <div className="text-2xl mb-2">🟠</div>
              <div className="text-orange-300 font-semibold">Quartet</div>
              <div className="text-2xl font-bold text-white">{mockDensityStats.quartet}</div>
              <div className="text-xs text-gray-400">4-7 per block</div>
            </div>

            <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <div className="text-2xl mb-2">🟣</div>
              <div className="text-purple-300 font-semibold">Octet</div>
              <div className="text-2xl font-bold text-white">{mockDensityStats.octet}</div>
              <div className="text-xs text-gray-400">8-15 per block</div>
            </div>

            <div className="text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="text-2xl mb-2">🔴</div>
              <div className="text-red-300 font-semibold">Surge</div>
              <div className="text-2xl font-bold text-white">{mockDensityStats.surge}</div>
              <div className="text-xs text-gray-400">16+ per block</div>
            </div>
          </div>
        </motion.div>

        {/* Style Packs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <Palette className="w-6 h-6 text-purple-500 mr-2" />
              Style Packs
            </h3>
            <p className="text-gray-400">Different visual themes for your Oscillyx NFTs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-cyan-300 mb-2">Neon Flux</h4>
              <p className="text-sm text-gray-300 mb-3">Electric neon aesthetics with pulsing geometric curves</p>
              <div className="text-2xl font-bold text-white">~33%</div>
              <div className="text-xs text-gray-400">of collection</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-pink-900/20 to-red-900/20 border border-pink-500/30 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-pink-300 mb-2">Ukiyo-e</h4>
              <p className="text-sm text-gray-300 mb-3">Japanese woodblock inspired flowing organic forms</p>
              <div className="text-2xl font-bold text-white">~33%</div>
              <div className="text-xs text-gray-400">of collection</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-gray-800/20 to-gray-900/20 border border-gray-500/30 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-300 mb-2">Noir Minimal</h4>
              <p className="text-sm text-gray-300 mb-3">Clean monochrome geometry with stark contrasts</p>
              <div className="text-2xl font-bold text-white">~33%</div>
              <div className="text-xs text-gray-400">of collection</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}