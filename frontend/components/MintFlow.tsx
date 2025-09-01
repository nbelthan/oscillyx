'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { X, Twitter, CheckCircle, ExternalLink, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { OSCILLYX_ABI, CONTRACT_ADDRESS, SIGNATURE_SERVICE_URL, TWITTER_HANDLE } from '@/lib/contract';

interface MintFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignatureResponse {
  signature: string;
  deadline: number;
  error?: string;
}

export function MintFlow({ isOpen, onClose }: MintFlowProps) {
  const { address } = useAccount();
  const [step, setStep] = useState<'connect' | 'follow' | 'tweet' | 'verify' | 'mint' | 'success'>('connect');
  const [tweetUrl, setTweetUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [mintData, setMintData] = useState<SignatureResponse | null>(null);
  const [referrer, setReferrer] = useState<string>('');
  const [mintedTokenIds, setMintedTokenIds] = useState<number[]>([]);

  // Get user's current nonce for signature generation
  const { data: userNonce } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: OSCILLYX_ABI,
    functionName: 'nonces',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Contract write for minting
  const { 
    write: mintWrite, 
    data: mintTxData, 
    isLoading: isMintLoading,
    error: mintError 
  } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: OSCILLYX_ABI,
    functionName: 'mint',
  });

  // Wait for mint transaction
  const { 
    isLoading: isTxLoading, 
    isSuccess: isTxSuccess,
    data: txReceipt 
  } = useWaitForTransaction({
    hash: mintTxData?.hash,
  });

  // Auto-advance through initial steps if already connected
  useEffect(() => {
    if (address && step === 'connect') {
      setStep('follow');
    }
  }, [address, step]);

  // Handle successful transaction
  useEffect(() => {
    if (isTxSuccess && txReceipt) {
      // Parse minted token IDs from events
      const mintedEvents = txReceipt.logs
        .filter(log => log.topics[0] === '0x...' && log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) // Minted event
        .map(log => {
          // Decode token ID from log data (simplified)
          const tokenId = parseInt(log.topics[2]!, 16);
          return tokenId;
        });
      
      setMintedTokenIds(mintedEvents);
      setStep('success');
      toast.success(`Successfully minted ${mintedEvents.length} token(s)!`);
    }
  }, [isTxSuccess, txReceipt]);

  // Handle mint errors
  useEffect(() => {
    if (mintError) {
      toast.error(`Mint failed: ${mintError.message}`);
    }
  }, [mintError]);

  const generateTweetContent = () => {
    const baseText = `Just claimed my FREE OSCILLYX NFT! 🔥\n\nEach NFT features unique colors determined by @monad_xyz block data, generated 100% on-chain.\n\nSame pattern, different colors - mine captures the exact moment of blockchain consensus! ⚡`;
    const hashtags = `#Oscillyx #MonadNFT #OnChainArt #FreeMint #Web3`;
    const walletTag = address ? `\n\nMy wallet: ${address.slice(0, 6)}...${address.slice(-4)}` : '';
    
    return `${baseText}${walletTag}\n\n${hashtags}`;
  };

  const createTweet = () => {
    const tweetText = encodeURIComponent(generateTweetContent());
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(window.location.href)}`;
    window.open(tweetUrl, '_blank');
  };

  const followTwitter = () => {
    const followUrl = `https://twitter.com/intent/follow?screen_name=${TWITTER_HANDLE.replace('@', '')}`;
    window.open(followUrl, '_blank');
  };

  const verifyAndMint = async () => {
    if (!tweetUrl || !address) return;
    
    setIsVerifying(true);
    
    try {
      // Extract tweet ID from URL
      const tweetId = tweetUrl.split('/status/')[1]?.split(/[?#]/)[0];
      if (!tweetId) {
        throw new Error('Invalid tweet URL');
      }

      // Call signature service
      const response = await fetch(`${SIGNATURE_SERVICE_URL}/mint-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          sourceId: 0, // Twitter
          tweetId,
          referrer: referrer || null,
        }),
      });

      const data: SignatureResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMintData(data);
      setStep('mint');
      toast.success('Verified! Ready to mint.');
      
    } catch (error) {
      toast.error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const executeMint = () => {
    if (!mintData || !address) return;

    try {
      mintWrite({
        args: [
          mintData.signature as `0x${string}`,
          (referrer || '0x0000000000000000000000000000000000000000') as `0x${string}`,
          0, // sourceId: Twitter (uint8)
          BigInt(1), // qty (uint256 as bigint)
          BigInt(mintData.deadline), // deadline (uint256 as bigint)
        ],
      });
    } catch (error) {
      toast.error(`Mint setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stepContent = {
    connect: {
      title: 'Connect Your Wallet',
      content: (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-6">Connect your wallet to begin the minting process.</p>
        </div>
      ),
    },
    follow: {
      title: 'FOLLOW @OSCILLYX',
      content: (
        <div className="text-center py-8 font-mono">
          <p className="text-gray-300 mb-6 font-mono">
            Follow our Twitter to unlock your FREE NFT mint.
          </p>
          <button onClick={followTwitter} className="bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold py-3 px-6 mb-4">
            <Twitter className="w-5 h-5 mr-2" />
            FOLLOW @{TWITTER_HANDLE.replace('@', '')}
          </button>
          <button 
            onClick={() => setStep('tweet')} 
            className="btn-secondary mt-4 w-full font-mono"
          >
            I'VE FOLLOWED - NEXT STEP
          </button>
        </div>
      ),
    },
    tweet: {
      title: 'TWEET ABOUT OSCILLYX',
      content: (
        <div className="text-center py-8 font-mono">
          <p className="text-gray-300 mb-6 font-mono">
            Share a tweet to prove you're ready for your FREE NFT.
          </p>
          <div className="bg-black border-2 border-gray-700 p-4 mb-6 text-left">
            <p className="text-sm text-gray-300 font-mono">{generateTweetContent()}</p>
          </div>
          <button onClick={createTweet} className="bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold py-3 px-6 mb-4">
            <Twitter className="w-5 h-5 mr-2" />
            COMPOSE TWEET
          </button>
          <button 
            onClick={() => setStep('verify')} 
            className="btn-secondary w-full font-mono"
          >
            I'VE TWEETED - NEXT STEP
          </button>
        </div>
      ),
    },
    verify: {
      title: 'Verify Your Tweet',
      content: (
        <div className="py-8">
          <p className="text-gray-300 mb-6">
            Paste the URL of your tweet to verify and unlock minting.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tweet URL
              </label>
              <input
                type="url"
                placeholder="https://twitter.com/username/status/..."
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-neon-500 focus:ring-1 focus:ring-neon-500 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Referrer (Optional)
              </label>
              <input
                type="text"
                placeholder="0x... or leave empty"
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-neon-500 focus:ring-1 focus:ring-neon-500 text-white"
              />
            </div>
          </div>
          
          <button 
            onClick={verifyAndMint}
            disabled={!tweetUrl || isVerifying}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</>
            ) : (
              <><CheckCircle className="w-5 h-5 mr-2" /> Verify & Continue</>
            )}
          </button>
        </div>
      ),
    },
    mint: {
      title: 'Mint Your Oscillyx',
      content: (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-6">
            You're verified! Click below to mint your on-chain generative NFT.
          </p>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-green-300 text-sm">Twitter verification complete!</p>
          </div>
          <button 
            onClick={executeMint}
            disabled={isMintLoading || isTxLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMintLoading || isTxLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {isMintLoading ? 'Confirm in Wallet...' : 'Minting...'}</>
            ) : (
              <><Users className="w-5 h-5 mr-2" /> Mint Oscillyx NFT</>
            )}
          </button>
        </div>
      ),
    },
    success: {
      title: 'Successfully Minted! 🎉',
      content: (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-300 mb-6">
            Your Oscillyx NFT{mintedTokenIds.length > 1 ? 's' : ''} ha{mintedTokenIds.length > 1 ? 've' : 's'} been minted!
          </p>
          
          {mintedTokenIds.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-2">Token ID{mintedTokenIds.length > 1 ? 's' : ''}:</h4>
              <div className="space-y-1">
                {mintedTokenIds.map(tokenId => (
                  <p key={tokenId} className="text-neon-500 font-mono">#{tokenId}</p>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://testnet.monadexplorer.com/tx/${mintTxData?.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Transaction
            </a>
            <button 
              onClick={() => {/* TODO: Implement share functionality */}}
              className="btn-primary"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Share Success
            </button>
          </div>
        </div>
      ),
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black border-2 border-cyan-400 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-400/20"
        >
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-700 bg-gray-900/50">
            <h2 className="text-xl font-bold text-cyan-400 font-mono">{stepContent[step].title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            {stepContent[step].content}
          </div>
          
          {/* Progress indicators */}
          <div className="p-6 pt-0">
            <div className="flex justify-center space-x-2">
              {['connect', 'follow', 'tweet', 'verify', 'mint', 'success'].map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step ? 'bg-neon-500' :
                    ['connect', 'follow', 'tweet', 'verify', 'mint', 'success'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}