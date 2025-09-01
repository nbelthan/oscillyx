import { Address } from 'viem';

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
export const SIGNATURE_SERVICE_URL = process.env.NEXT_PUBLIC_SIGNATURE_SERVICE_URL!;
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE!;

// Oscillyx contract ABI (essential functions only)
export const OSCILLYX_ABI = [
  // Read functions
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol", 
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getTokenMeta",
    "outputs": [
      {
        "components": [
          {"internalType": "uint32", "name": "blockNo", "type": "uint32"},
          {"internalType": "uint16", "name": "indexInBlock", "type": "uint16"}, 
          {"internalType": "bytes16", "name": "seed", "type": "bytes16"},
          {"internalType": "uint8", "name": "sourceId", "type": "uint8"},
          {"internalType": "address", "name": "referrer", "type": "address"}
        ],
        "internalType": "struct Oscillyx.Meta",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint32", "name": "blockNo", "type": "uint32"}],
    "name": "getCohortInfo",
    "outputs": [
      {"internalType": "uint16", "name": "count", "type": "uint16"},
      {"internalType": "bytes32", "name": "digest", "type": "bytes32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintingActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "nonces",
    "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "posterCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint32", "name": "blockNo", "type": "uint32"}],
    "name": "blockCount",
    "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [
      {"internalType": "bytes", "name": "signature", "type": "bytes"},
      {"internalType": "address", "name": "referrer", "type": "address"},
      {"internalType": "uint8", "name": "sourceId", "type": "uint8"},
      {"internalType": "uint256", "name": "qty", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable", 
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint32", "name": "blockNo", "type": "uint32"}],
    "name": "mintPoster",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "uint32", "name": "blockNo", "type": "uint32"},
      {"indexed": false, "internalType": "uint16", "name": "indexInBlock", "type": "uint16"},
      {"indexed": false, "internalType": "uint8", "name": "sourceId", "type": "uint8"},
      {"indexed": true, "internalType": "address", "name": "referrer", "type": "address"}
    ],
    "name": "Minted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint32", "name": "blockNo", "type": "uint32"},
      {"indexed": false, "internalType": "uint16", "name": "newSize", "type": "uint16"},
      {"indexed": false, "internalType": "bytes32", "name": "newDigest", "type": "bytes32"}
    ],
    "name": "CohortUpdated",
    "type": "event"
  }
] as const;

// Temporary backwards compatibility
export const BLOCKWEAVE_ABI = OSCILLYX_ABI;

// Source ID mappings
export const SOURCE_NAMES = {
  0: 'Twitter',
  1: 'Discord', 
  2: 'Telegram',
  3: 'Layer3',
  4: 'Galxe',
  255: 'Poster'
} as const;

export type SourceId = keyof typeof SOURCE_NAMES;

// Density tier mappings
export const DENSITY_TIERS = {
  0: 'Solo',
  1: 'Pair',
  2: 'Trio', 
  3: 'Quartet',
  4: 'Octet',
  5: 'Surge'
} as const;

// Style pack mappings
export const STYLE_PACKS = {
  0: 'Neon Flux',
  1: 'Ukiyo-e',
  2: 'Noir Minimal'
} as const;