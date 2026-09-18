# RUSH.FUN

RUSH.FUN is a consumer-friendly social discovery layer for onchain markets.

The core loop is:

Discover → Understand → Get curious → See what people think → Form an opinion → Participate → Return.

## Architecture

- Web: Next.js + React, deployed to Vercel.
- API: Fastify + TypeScript, deployed to Render.
- Database/Auth: Supabase Postgres + Auth.
- Base market data: GeckoTerminal documented Base endpoints.
- StonkFun market data: Bitquery documented StonkFun/Trading integration.
- Wallet: wagmi + viem on Base.
- Optional intelligence: OpenAI Responses API, only when OPENAI_API_KEY is configured.

Browsing does not require a wallet or account. Publishing, comments, reactions, follows and wallet linking require authentication.

## Development

1. Copy .env.example to the appropriate local environment files.
2. Apply all Supabase migrations in order.
3. Install with pnpm.
4. Run the API and web workspace commands.

No production market, price, wallet balance, trade, transaction or social data is hardcoded.

## External integration note

StonkFun is currently a Solana launchpad. Its documented data integration can be queried through Bitquery, which requires an API token outside the Bitquery IDE. RUSH.FUN keeps this behind the provider abstraction so another provider can be added without changing the social domain.

Participation is intentionally not represented as a fake transaction flow. A verified execution provider can be added behind the same provider boundary once its current API and transaction contract are confirmed.

See ARCHITECTURE.md, INTEGRATIONS.md, ENVIRONMENT.md, DEPLOYMENT.md and TESTING.md.
