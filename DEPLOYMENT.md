# Deployment

Vercel deploys apps/web with NEXT_PUBLIC_* variables.
Render deploys apps/api using pnpm install --no-frozen-lockfile, then pnpm --filter @rush/api build and pnpm --filter @rush/api start.
Supabase applies supabase/migrations in order and supplies Auth.
