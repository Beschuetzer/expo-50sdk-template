# API

Node.js HTTP API for local development and production-oriented extension.

## Structure

- `src/config`: environment parsing and validated runtime configuration.
- `src/http`: transport-level response helpers.
- `src/routes`: individual HTTP route handlers.
- `src/app.ts`: request routing, independent of the listening socket.
- `src/server.ts`: server creation, startup, and shutdown lifecycle.
- `src/main.ts`: process entrypoint and signal handling.
- `src/app.spec.ts`: API contract tests using Node's built-in test runner.

## Runtime configuration

- `HOST`: bind address, default `0.0.0.0`.
- `PORT`: TCP port from `1` to `65535`, default `4200`.
- `NODE_ENV`: runtime environment label, default `development`.

## Commands

- `GET /health` returns a JSON health response.
- `npm run api` starts the API through Nx.
- `npx nx run api:test` runs the API contract tests.
- `npx nx run api:typecheck` validates TypeScript without emitting files.
- `npx nx run api:build` emits the compiled API to `dist/apps/api`.
- `npm run dev` starts the mobile app and API together.

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
