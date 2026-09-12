# Audit Summary

## Overall assessment

The repository has a strong development-template foundation: strict TypeScript,
clear Nx project boundaries, shared contracts, PKCE authentication, native
SecureStore usage, mobile internationalization, theme support, and CI coverage
enforcement.

It is not production-ready yet. The identity provider is an intentionally local
development scaffold, and the production boundary needs to be enforced more
strongly. The repository typecheck is also currently failing in the mobile test
suite.

## High priority

1. **Resolved:** Fixed the mobile typecheck failure in
   `apps/mobile/utils/i18n.spec.ts`. The test consumer now invokes `useI18n()`
   and returns `null` while asserting the expected error.

2. Replace the identity provider's ephemeral signing keys. The provider
	 generates a new RSA key pair on every startup in
	 `apps/identity-provider/src/security/tokens.ts`. Existing tokens become
	 invalid after restarts, multiple instances cannot share keys, and the
	 configured `IDP_SIGNING_KEY_SECRET` is not used for signing. Use durable
	 managed keys, stable key IDs, rotation, and a JWKS strategy for current and
	 recently retired keys.

3. Keep the identity provider development-only until its in-memory stores are
	 replaced. `apps/identity-provider/src/infrastructure/memory.ts` contains
	 plaintext demo passwords and client secrets, in-memory users and clients,
	 and in-memory authorization codes. Production requires password hashing,
	 persistent clients/users, durable or distributed authorization-code storage,
	 expiration cleanup, and audit logging.

## Security recommendations

- Add rate limiting, request-size limits, security headers, structured logging,
	and schema validation to the identity provider.
- Use complete HTML attribute escaping in `renderLogin()` and validate OAuth
	parameters before rendering them.
- Preserve the existing exact redirect URI matching, S256 PKCE, single-use
	authorization codes, and scope checks.
- **Resolved:** Production-like mobile environments now fail fast when required
	Expo environment values are missing; localhost fallback remains development-only.
- **Resolved:** Removed the broad Android permission list from `apps/mobile/app.json`.
	Active Expo plugins now declare feature-specific camera, location, image-picker,
	and media-library permissions; microphone, foreground-service, and legacy
	external-storage permissions are no longer requested.
- Add dependency review, Dependabot, and an explicit vulnerability triage
	policy to CI.

## API recommendations

- **Resolved:** The health route now uses the loaded `ApiConfig` and an
	injectable database health dependency instead of reading
	`process.env.DATABASE_URL` directly.
- **Resolved:** API tests now cover invalid and expired JWT-shaped failures,
	missing scopes, malformed JSON, database degradation, and response contracts.
- **Resolved:** The API now generates or preserves safe request IDs, returns
	them in `X-Request-ID`, and emits structured request/error logs.
- **Resolved:** API error responses are generic and include a correlation ID;
	detailed authentication, parsing, and database failures remain server-side.

## Mobile recommendations

- **Resolved:** TanStack Query persistence now allowlists successful backend
	health data, and authentication invalidation clears in-memory and persisted
	query cache data.
- **Resolved:** `apps/mobile/app.json` now uses automatic native interface
	style selection, preserving system theme support alongside the runtime's
	light and dark mode settings.
- Add crash reporting and production diagnostics around error boundaries and
	persistence failures.
- Continue routing all visible text through `apps/mobile/utils/i18n.tsx` and
	all new styling through theme-aware values.

## CI and maintainability recommendations

- Add check-only linting and Expo validation to CI. The current lint command
	uses `--fix`, which should not be used as a CI validation command.
- Add a lightweight Expo config/doctor check and a separate release workflow
	for mobile builds.
- Expand identity-provider tests for malformed PKCE, replayed codes, invalid
	redirects, invalid scopes, bad client authentication, and expiration.
- Keep API and identity-provider tests focused on real behavior rather than
	implementation mocks.
- Document the development-only security posture prominently in deployment
	documentation and require explicit production configuration at startup.

## Strengths to preserve

- Strict TypeScript and clear Nx boundaries.
- Platform-neutral shared contracts in `libs/shared-types`.
- S256 PKCE, exact redirect URI matching, and single-use authorization codes.
- Native SecureStore with device-only keychain accessibility.
- Mobile i18n and system/light/dark theme support.
- Explicit Prisma client generation in CI.
- CI coverage enforcement and locked dependency installation with `npm ci`.