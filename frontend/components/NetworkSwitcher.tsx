'use client';

import { useState } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { monadTestnet } from '@/lib/wagmi';

export function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { switchNetwork, isLoading, error } = useSwitchNetwork();
  const [showDetails, setShowDetails] = useState(false);

  const isCorrectNetwork = chain?.id === monadTestnet.id;

  if (isCorrectNetwork) {
    return null; // Don't show if already on correct network
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 px-4 py-2 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-medium transition-all duration-300"
      >
        <AlertTriangle className="w-4 h-4" />
        <span>Wrong Network</span>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Network Status</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-200 text-sm"
                >
                  ×
                </button>
              </div>

              {/* Current Network */}
              <div className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/30 rounded">
                <div>
                  <p className="text-red-300 text-sm font-medium">Current Network</p>
                  <p className="text-red-200 text-xs">{chain?.name || 'Unknown'}</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>

              {/* Target Network */}
              <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded">
                <div>
                  <p className="text-green-300 text-sm font-medium">Required Network</p>
                  <p className="text-green-200 text-xs">{monadTestnet.name}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2 bg-red-900/20 border border-red-500/30 rounded">
                  <p className="text-red-300 text-xs">{error.message}</p>
                </div>
              )}

              {/* Switch Button */}
              <button
                onClick={() => switchNetwork?.(monadTestnet.id)}
                disabled={isLoading || !switchNetwork}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-neon-600 hover:bg-neon-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Switching...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Switch to {monadTestnet.name}</span>
                  </>
                )}
              </button>

              {/* Instructions */}
              <div className="text-xs text-gray-400 space-y-1">
                <p>To use Oscillyx, please switch to Monad Testnet:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Network: {monadTestnet.name}</li>
                  <li>Chain ID: {monadTestnet.id}</li>
                  <li>RPC: {monadTestnet.rpcUrls.public.http[0]}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}