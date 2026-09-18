# Deployment

## Vercel

Create the Vercel project against this repository with Root Directory set to apps/web. Vercel then uses the Next.js project in that directory. Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and optionally NEXT_PUBLIC_BASE_RPC_URL.

## Render

Deploy the repository using render.yaml. The API service builds the shared config/types packages before compiling Fastify, then starts the compiled API. Render's PORT is honored by the API automatically. Set the Supabase, Bitquery, OpenAI and CORS environment variables in Render.

## Supabase

Create a project and apply supabase/migrations/0001_initial.sql. Configure Supabase Auth for email OTP/magic-link authentication. Keep the service-role key server-only.

## Synchronization

Run pnpm --filter @rush/api sync from a trusted scheduler after production credentials and the Supabase schema are configured. The sync command is idempotent at the provider/market/activity keys and continues across individual provider failures.
