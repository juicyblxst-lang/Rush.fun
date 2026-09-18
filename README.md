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
2. Apply supabase/migrations/0001_initial.sql to a Supabase project.
3. Install with pnpm.
4. Run the API and web workspace commands.

No production market, price, wallet balance or social data is hardcoded.

## External integration note

StonkFun is currently a Solana launchpad. Its documented data integration can be queried through Bitquery, which requires an API token outside the Bitquery IDE. RUSH.FUN keeps this behind the provider abstraction so another StonkFun-compatible source can be added without changing the social domain.

See ARCHITECTURE.md, INTEGRATIONS.md, ENVIRONMENT.md, DEPLOYMENT.md and TESTING.md.
