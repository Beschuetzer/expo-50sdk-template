# API

Node.js HTTP API for local development and production-oriented extension.

## Structure

- `src/config`: environment parsing and validated runtime configuration.
- `src/auth`: OAuth2 bearer-token middleware and the injectable auth boundary.
- `src/routes`: individual HTTP route handlers.
- `src/app.ts`: Express middleware and versioned route composition, independent of the listening socket.
- `src/server.ts`: server creation, startup, and shutdown lifecycle.
- `src/main.ts`: process entrypoint and signal handling.
- `src/app.spec.ts`: API contract tests using Node's built-in test runner.

## Runtime configuration

- `HOST`: bind address, default `0.0.0.0`.
- `PORT`: TCP port from `1` to `65535`, default `4200`.
- `NODE_ENV`: runtime environment label, default `development`.
- `AUTH_ISSUER_BASE_URL`: OAuth2/OIDC issuer base URL. Required for protected routes.
- `AUTH_AUDIENCE`: expected OAuth2 access-token audience. Required for protected routes.
- `AUTH_REQUIRED_SCOPES`: optional space- or comma-separated scopes required by all protected routes.

## Commands

- `GET /health` returns a public JSON health response for deployment probes.
- `GET /api/v1/me` is a protected example resource and requires a valid OAuth2 bearer token.
- `npm run api` starts the API through Nx.
- `npx nx run api:test` runs the API contract tests.
- `npx nx run api:typecheck` validates TypeScript without emitting files.
- `npx nx run api:build` emits the compiled API to `dist/apps/api`.
- `npm run dev` starts the mobile app and API together.

### OAuth2 architecture

The API is an OAuth2 resource server, not an identity provider. An external
OAuth2/OIDC provider issues access tokens; the API validates those tokens using
issuer discovery, audience validation, and cached JWKS keys through
`express-oauth2-jwt-bearer`. It does not store client secrets or passwords.

Protected routes are mounted under `/api/v1` and receive the validated claims
on `request.auth`. Keep provider-specific behavior inside
`src/auth/middleware.ts`; route handlers should consume claims and remain
independent of Auth0, Entra, Okta, or another provider. Tests can inject an
`AuthMiddleware` through `createApp` without contacting a real identity
provider.

For local development, leave the OAuth2 variables unset while working on
public routes. Protected routes fail closed with `503 auth_not_configured`
until the provider settings are supplied. Never replace that behavior with a
development token bypass in shared or production code.

## Deploy to Heroku

This repository is an Nx monorepo, so Heroku must be configured against the
repository root, not `apps/api`. The root `build` script builds the API, and
the root `Procfile` starts the compiled API with `npm run api:start`.

### Prerequisites

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
2. Log in with `heroku login`.
3. Commit the repository changes you want to deploy.

From the repository root, run:

```sh
npm install
npm run heroku:setup -- my-api-name
```

The setup command:

- builds the API locally with `npm run api:build`;
- creates the Heroku app if it does not exist;
- adds or updates the `heroku` Git remote; and
- sets `NODE_ENV=production`.

It does not set `PORT` or `HOST`. Heroku supplies `PORT` dynamically, and the
API defaults to listening on `0.0.0.0`, which is the correct binding for a
Heroku dyno. Do not hard-code either value in Heroku config.

The setup command only configures the app. Deploy the current branch with:

```sh
git push heroku HEAD:main
```

Or configure and deploy in one explicit command:

```sh
npm run heroku:setup -- my-api-name --deploy
```

Heroku will run the root `npm run build` lifecycle during deployment and then
use the `web` process from `Procfile`. After deployment, verify the API with:

```sh
heroku open /health --app my-api-name
```

The expected response contains `"status":"ok"`. Logs are available with:

```sh
heroku logs --tail --app my-api-name
```

### Connecting the mobile app

The mobile app must use the deployed HTTPS URL in its production environment,
for example `https://my-api-name-abc123.herokuapp.com`. Do not use the local
`192.168.x.x:4200` address outside local development. Configure the mobile
Expo public environment values for the deployment before creating the mobile
build, including the production environment marker and API host expected by
the mobile URL resolver.

Heroku config variables are appropriate for server-side configuration and
secrets. Mobile `EXPO_PUBLIC_*` values are bundled into the client and are not
secret.
