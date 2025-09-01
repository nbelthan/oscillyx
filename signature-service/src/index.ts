/**
 * Oscillyx Signature Service
 * Cloudflare Worker for generating EIP-712 signatures for Twitter-verified mints
 */

import { ethers } from 'ethers';

interface Env {
  OSCILLYX_KV: KVNamespace;
  PRIVATE_KEY: string;
  TWITTER_BEARER_TOKEN: string;
  ENVIRONMENT: string;
}

interface MintAuthRequest {
  address: string;
  sourceId: number;
  tweetId: string;
  referrer?: string | null;
}

interface MintAuthResponse {
  signature: string;
  deadline: number;
  error?: string;
}

// EIP-712 Domain for signature generation
const DOMAIN = {
  name: 'Oscillyx',
  version: '1',
  chainId: 10143, // Monad testnet
  verifyingContract: '', // Will be set from environment
};

// EIP-712 Type definition for mint authorization
const TYPES = {
  MintAuth: [
    { name: 'to', type: 'address' },
    { name: 'referrer', type: 'address' },
    { name: 'sourceId', type: 'uint8' },
    { name: 'qty', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'nonce', type: 'uint64' },
  ],
};

async function verifyTweet(tweetId: string, expectedWallet: string, bearerToken: string): Promise<boolean> {
  try {
    // Twitter API v2 - Get tweet by ID
    const tweetResponse = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=author_id,text,created_at`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tweetResponse.ok) {
      console.error('Twitter API error:', await tweetResponse.text());
      return false;
    }

    const tweetData = await tweetResponse.json();
    const tweet = tweetData.data;

    if (!tweet) {
      return false;
    }

    // Check if tweet contains the wallet address and Blockweave mentions
    const tweetText = tweet.text.toLowerCase();
    const walletInTweet = tweetText.includes(expectedWallet.toLowerCase());
    const hasOscillyx = tweetText.includes('oscillyx') || tweetText.includes('#oscillyx');
    const hasMonad = tweetText.includes('monad') || tweetText.includes('@monad_xyz');

    return walletInTweet && hasOscillyx && hasMonad;
  } catch (error) {
    console.error('Tweet verification error:', error);
    return false;
  }
}

async function generateSignature(
  request: MintAuthRequest,
  nonce: number,
  privateKey: string,
  contractAddress: string
): Promise<MintAuthResponse> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const domain = { ...DOMAIN, verifyingContract: contractAddress };

    const value = {
      to: request.address,
      referrer: request.referrer || ethers.ZeroAddress,
      sourceId: request.sourceId,
      qty: 1, // Always 1 for free mints
      deadline: deadline,
      nonce: nonce,
    };

    const signature = await wallet.signTypedData(domain, TYPES, value);

    return {
      signature,
      deadline,
    };
  } catch (error) {
    return {
      signature: '',
      deadline: 0,
      error: `Signature generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

async function handleMintAuth(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json() as MintAuthRequest;
    const { address, sourceId, tweetId, referrer } = body;

    // Validate request
    if (!address || !ethers.isAddress(address)) {
      return new Response(JSON.stringify({ error: 'Invalid address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (sourceId !== 0) { // Only Twitter for now
      return new Response(JSON.stringify({ error: 'Only Twitter verification supported' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!tweetId) {
      return new Response(JSON.stringify({ error: 'Tweet ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if already used this tweet
    const tweetKey = `tweet:${tweetId}`;
    const existingTweet = await env.OSCILLYX_KV.get(tweetKey);
    if (existingTweet) {
      return new Response(JSON.stringify({ error: 'Tweet already used for minting' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify tweet (skip in development)
    if (env.ENVIRONMENT === 'production') {
      const isValidTweet = await verifyTweet(tweetId, address, env.TWITTER_BEARER_TOKEN);
      if (!isValidTweet) {
        return new Response(JSON.stringify({ error: 'Tweet verification failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get nonce for user
    const nonceKey = `nonce:${address.toLowerCase()}`;
    const currentNonce = parseInt(await env.OSCILLYX_KV.get(nonceKey) || '0');
    const newNonce = currentNonce + 1;

    // Generate signature
    const contractAddress = '0x4eba94d2B83427c3baf78bC0E9F67c7f2fCb5F4e'; // Replace with actual contract
    const response = await generateSignature(body, newNonce, env.PRIVATE_KEY, contractAddress);

    if (response.error) {
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Store used tweet and update nonce
    await env.OSCILLYX_KV.put(tweetKey, address, { expirationTtl: 86400 * 7 }); // 7 days
    await env.OSCILLYX_KV.put(nonceKey, newNonce.toString());

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Mint auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleOptions(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    switch (url.pathname) {
      case '/mint-auth':
        return handleMintAuth(request, env);
      
      case '/health':
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { 'Content-Type': 'application/json' },
        });
      
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  },
};