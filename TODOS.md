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

1. Fix the mobile typecheck failure in `apps/mobile/utils/i18n.spec.ts`.
	 The test component returns the `I18nContextValue` object instead of a valid
	 React node. Call `useI18n()` and return `null` while asserting the expected
	 error.

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
- Use a production web authentication design based on an HttpOnly, Secure,
	SameSite cookie or a backend-for-frontend. The current web token storage in
	`apps/mobile/features/auth/storage.ts` is in-memory and is not suitable for a
	production web client.
- Make production mobile environment configuration fail fast instead of
	silently falling back to `127.0.0.1:4200`.
- Minimize the permissions in `app.json`; request camera, microphone, location,
	foreground-service, and storage permissions only when required by an enabled
	feature.
- Add dependency review, Dependabot, and an explicit vulnerability triage
	policy to CI.

## API recommendations

- Make the health route consume the loaded `ApiConfig` or an injected database
	health dependency instead of reading `process.env.DATABASE_URL` directly.
- Add tests for invalid and expired JWTs, missing scopes, malformed JSON,
	database degradation, and response contracts.
- Add request IDs and structured logs before operating the API in production.
- Keep generic error responses for clients while logging detailed errors only
	on the server.

## Mobile recommendations

- Define which TanStack Query data may be persisted in AsyncStorage and purge
	account-specific cache data on logout.
- Verify that `app.json` does not force light-only native behavior while the
	runtime supports system, light, and dark modes.
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