# Deployment

## 1. Supabase

Create a Supabase project and apply migrations in order:
1. supabase/migrations/0001_initial.sql
2. supabase/migrations/0002_wallet_link_challenges.sql

Configure Auth for the email OTP/magic-link flow used by the web app. Set the production Site URL and redirect URLs to the deployed Vercel origin. Keep the service-role key server-only.

## 2. Render API

Deploy the repository using render.yaml. The API build compiles the shared config/types packages before Fastify and the start command runs the compiled API. Render's PORT is honored automatically.

Set:
- API_CORS_ORIGIN = exact Vercel origin
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- BITQUERY_API_KEY if StonkFun discovery is desired
- OPENAI_API_KEY and OPENAI_MODEL if agent/moderation features are desired
- GECKOTERMINAL_API_BASE if overriding the documented default

The Render health check is /health.

## 3. Vercel web

Set Root Directory to apps/web. Set:
- NEXT_PUBLIC_API_URL = deployed Render API origin
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_BASE_RPC_URL if overriding the Base RPC

Do not add server-only secrets to Vercel's NEXT_PUBLIC_* variables.

## 4. Market synchronization

After the Supabase schema and production provider credentials are configured, run:
pnpm --filter @rush/api sync

Schedule this command from a trusted scheduler. The sync is idempotent on provider/external identifiers and continues across individual provider failures.

## 5. Production smoke test

1. Open the Vercel site with no wallet connected.
2. Confirm discovery can return real Base markets.
3. Sign in with Supabase Auth.
4. Connect a Base wallet.
5. Request the wallet-link challenge and sign it.
6. Confirm the wallet is persisted in Supabase.
7. Publish a thesis and comment; refresh and confirm persistence.
8. React and follow a profile; refresh and confirm persistence.
9. Open market context only when OPENAI_API_KEY is configured.
10. Confirm API /health returns status ok.

RUSH.FUN does not fabricate balances, trades, market activity, or execution receipts. Participation/execution must be added through a verified provider adapter before any transaction flow is exposed.
