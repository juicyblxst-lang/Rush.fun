# RUSH.FUN architecture

Next.js consumer UI on Vercel, Fastify API on Render, Supabase Postgres/Auth.

Market data is normalized behind a MarketProvider contract. StonkFun uses Bitquery's documented StonkFun dataset because no safe public StonkFun REST contract could be verified. Base discovery uses GeckoTerminal's documented Base endpoints. Wallet state uses wagmi/viem on Base.

Browsing is public. Social mutations require Supabase authentication. Wallet connection is independent of browsing.
