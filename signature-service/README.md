# Oscillyx Signature Service

A Cloudflare Worker that generates EIP-712 signatures for Twitter-verified NFT mints.

## Features

- **Twitter Verification**: Validates tweets contain wallet address and Oscillyx mentions
- **EIP-712 Signatures**: Generates typed signatures for contract verification  
- **Anti-Replay Protection**: Prevents reuse of tweets and tracks user nonces
- **Rate Limiting**: Built-in KV storage for state management
- **CORS Support**: Ready for frontend integration

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Wrangler**:
   ```bash
   # Login to Cloudflare
   npx wrangler login
   
   # Create KV namespace
   npx wrangler kv:namespace create "OSCILLYX_KV"
   npx wrangler kv:namespace create "OSCILLYX_KV" --preview
   ```

3. **Set secrets**:
   ```bash
   # Private key for signature generation (without 0x prefix)
   npx wrangler secret put PRIVATE_KEY
   
   # Twitter Bearer Token for API access
   npx wrangler secret put TWITTER_BEARER_TOKEN
   ```

4. **Update wrangler.toml**:
   - Replace KV namespace IDs with your actual IDs
   - Update contract address in the code

## Deployment

```bash
# Development
npm run dev

# Production
npm run deploy:production
```

## API Endpoints

### POST /mint-auth

Verifies Twitter activity and generates mint signature.

**Request**:
```json
{
  "address": "0x...",
  "sourceId": 0,
  "tweetId": "1234567890",
  "referrer": "0x..." // optional
}
```

**Response**:
```json
{
  "signature": "0x...",
  "deadline": 1705123456
}
```

### GET /health

Health check endpoint.

## Environment Variables

- `PRIVATE_KEY`: Private key for signing (set via wrangler secret)
- `TWITTER_BEARER_TOKEN`: Twitter API v2 bearer token (set via wrangler secret)
- `ENVIRONMENT`: Set to "production" to enable tweet verification

## Security Notes

- Private keys are stored as Cloudflare secrets (encrypted)
- Tweet verification is skipped in development mode
- Nonces prevent signature replay attacks
- Each tweet can only be used once for minting