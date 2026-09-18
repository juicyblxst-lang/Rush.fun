# Environment

## API

Required:
- SUPABASE_URL — Supabase project URL.
- SUPABASE_PUBLISHABLE_KEY — Supabase publishable key used to validate bearer sessions.
- SUPABASE_SERVICE_ROLE_KEY — server-only Supabase secret key; never expose to the browser.
- API_CORS_ORIGIN — exact production web origin allowed by the API.

Optional:
- BITQUERY_API_KEY — enables the StonkFun/Bitquery provider. Leave empty to run Base-only discovery.
- GECKOTERMINAL_API_BASE — defaults to https://api.geckoterminal.com/api/v2.
- OPENAI_API_KEY — enables source-bounded market context and moderation.
- OPENAI_MODEL — model used by the market-context agent; defaults to gpt-5.
- PORT/API_PORT — Render PORT is preferred automatically; local API defaults to 4000.

## Web

Required at runtime:
- NEXT_PUBLIC_API_URL — deployed Render API origin.
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL.
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — browser-safe Supabase publishable key.

Optional:
- NEXT_PUBLIC_BASE_RPC_URL — Base RPC endpoint; defaults to https://mainnet.base.org.

No private key, service-role key, or other secret belongs in NEXT_PUBLIC_* variables.
