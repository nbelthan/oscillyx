'use client';

import { motion } from 'framer-motion';
import { Wallet, Twitter, Users, Zap, Activity, Layers, Code, Sparkles } from 'lucide-react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

function Step({ number, title, description, icon, delay }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="card text-center p-8">
        {/* Step Number */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-gradient-to-r from-neon-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">{number}</span>
          </div>
        </div>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

interface ConceptProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function Concept({ title, description, icon, color, delay }: ConceptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`card-highlight p-6 hover:scale-105 transition-transform`}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 bg-${color}-900/20 border border-${color}-500/30 rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h4 className={`text-lg font-bold text-${color}-300 mb-2`}>{title}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-black/20 to-purple-900/10 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold gradient-text mb-4"
          >
            How Oscillyx Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            A revolutionary approach to on-chain generative art that captures the pulse of blockchain activity
          </motion.p>
        </div>

        {/* Minting Process */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white text-center mb-12"
          >
            Minting Process
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines for Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-500 via-purple-500 to-neon-500 transform -translate-y-1/2 z-0" />

            <Step
              number={1}
              title="Connect Wallet"
              description="Link your wallet to the Monad testnet and ensure you have some MON for gas fees."
              icon={<Wallet className="w-8 h-8 text-neon-500" />}
              delay={0.3}
            />

            <Step
              number={2}
              title="Social Verification"
              description="Follow our Twitter and share a tweet to unlock your free mint eligibility."
              icon={<Twitter className="w-8 h-8 text-blue-500" />}
              delay={0.4}
            />

            <Step
              number={3}
              title="Mint Together"
              description="Your NFT joins others minted in the same block, forming a unique cohort."
              icon={<Users className="w-8 h-8 text-green-500" />}
              delay={0.5}
            />

            <Step
              number={4}
              title="Art Generated"
              description="On-chain algorithms create your unique art based on block data and cohort dynamics."
              icon={<Sparkles className="w-8 h-8 text-purple-500" />}
              delay={0.6}
            />
          </div>
        </div>

        {/* Core Concepts */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-white text-center mb-12"
          >
            Core Concepts
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Concept
              title="Block Cohorts"
              description="NFTs minted in the same block share a cohort identity. The size of your cohort affects the rarity and visual style of your NFT."
              icon={<Activity className="w-6 h-6 text-neon-400" />}
              color="neon"
              delay={0.8}
            />

            <Concept
              title="Density Tiers"
              description="From Solo (1) to Surge (16+), each density tier has unique visual properties. Rare surge events create the most coveted pieces."
              icon={<Layers className="w-6 h-6 text-purple-400" />}
              color="purple"
              delay={0.9}
            />

            <Concept
              title="100% On-Chain"
              description="All art generation happens on-chain using mathematical algorithms. No IPFS, no external dependencies - pure blockchain art."
              icon={<Code className="w-6 h-6 text-green-400" />}
              color="green"
              delay={1.0}
            />

            <Concept
              title="Living Metadata"
              description="Token metadata evolves based on cohort dynamics and blockchain events. Your NFT grows with the network."
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              color="yellow"
              delay={1.1}
            />

            <Concept
              title="Style Packs"
              description="Three distinct visual themes - Neon Flux, Ukiyo-e, and Noir Minimal - each with their own aesthetic and mathematical basis."
              icon={<Sparkles className="w-6 h-6 text-pink-400" />}
              color="pink"
              delay={1.2}
            />

            <Concept
              title="Poster System"
              description="Special commemorative NFTs can be minted by the team to mark significant events or milestones in the project's evolution."
              icon={<Users className="w-6 h-6 text-blue-400" />}
              color="blue"
              delay={1.3}
            />
          </div>
        </div>

        {/* Technical Innovation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="card text-center"
        >
          <h3 className="text-2xl font-bold gradient-text mb-6">Technical Innovation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Code className="w-12 h-12 text-neon-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Gas Optimized</h4>
              <p className="text-gray-300 text-sm">
                ERC-721A implementation with batch minting capabilities and optimized storage patterns.
              </p>
            </div>

            <div>
              <Activity className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Tracking</h4>
              <p className="text-gray-300 text-sm">
                Live cohort meters and block-level analytics provide unprecedented insight into minting dynamics.
              </p>
            </div>

            <div>
              <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Mathematical Art</h4>
              <p className="text-gray-300 text-sm">
                Lissajous curves and geometric transformations create unique patterns from blockchain data.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}