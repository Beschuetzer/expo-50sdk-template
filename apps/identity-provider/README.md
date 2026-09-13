# Identity Provider

Development OAuth2/OIDC identity-provider scaffold for the monorepo.

## Supported flows

- Authorization Code with PKCE using `S256`.
- Client Credentials for confidential clients.

Endpoints:

- `GET /.well-known/openid-configuration`
- `GET /.well-known/jwks.json`
- `GET /authorize`
- `POST /authorize`
- `POST /token`

The provider signs access tokens with an in-memory RSA key generated at startup.
The API can validate those tokens with:

```powershell
$env:AUTH_ISSUER_BASE_URL='http://localhost:4300'
$env:AUTH_AUDIENCE='api'
```

Development fixtures:

- Public PKCE client: `mobile-development-client`
- Confidential client: `api-development-client`
- Confidential secret: `api-development-secret`
- Demo user: `demo@example.com` / `demo-password`

The mobile client uses `expo50sdktemplate://oauth/callback` as its native
redirect URI. The development store also retains the browser callback at
`http://localhost:8081/oauth/callback`. `npm run dev` additionally registers
the current LAN Expo Go callback through `IDP_MOBILE_REDIRECT_URI`.

These fixtures and in-memory stores are intentionally replaceable. Implement
`ClientStore`, `UserStore`, and `AuthorizationCodeStore` against a database or
external identity system before deployment. Replace the signing-key lifecycle
with durable key management and rotation before production use.

## Commands

- `npm run idp` starts the provider through Nx.
- `npx nx run identity-provider:typecheck` validates TypeScript.
- `npx nx run identity-provider:test` runs the OAuth2 flow tests.
- `npx nx run identity-provider:build` creates the production output.