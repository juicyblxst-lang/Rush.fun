# Integrations

## Supabase
Auth + Postgres. The API uses the server-only service-role key for trusted writes and validates user bearer tokens through Supabase Auth.

## Base market discovery
GeckoTerminal provides real Base pool/token/trade data through the provider abstraction. No market values are hardcoded.

## StonkFun
Bitquery's StonkFun/Trading integration is optional and enabled only when BITQUERY_API_KEY is configured. StonkFun data currently represents Solana markets, while Base remains the primary RUSH.FUN ecosystem.

## Wallet
wagmi + viem provide Base wallet connection and message signing. Wallet linking uses a server-issued, expiring nonce so signatures cannot be replayed.

## AI
OpenAI is optional. Market context is generated only from supplied market/activity/thesis records and explicitly instructed not to invent facts. Moderation is capability-gated by OPENAI_API_KEY.

## Execution
RUSH.FUN does not expose a fabricated trade/execution endpoint. A real execution provider must be verified and added behind a provider contract before the UI can submit financial transactions.
