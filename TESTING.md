# Testing

CI runs deterministic install, shared-package compilation, lint, typecheck, unit tests and production builds. Test doubles are only used at legitimate external boundaries.

## Test layers

- Provider normalization and error-boundary unit tests.
- Deterministic Rush discovery ranking tests.
- Serializer and domain tests.
- Application/service integration tests can run against a configured Supabase test project.
- Browser E2E uses Playwright when a deployed/test environment is configured.

Production providers are never replaced by fake market or social data.

## Production E2E

After credentials are supplied, exercise: browse without wallet, open a real Base market, authenticate, publish a thesis/post, react, refresh, follow a profile, comment, inspect activity, and verify persisted market context. Wallet linking must use a real wallet signature. No fake signatures or financial transactions are used.