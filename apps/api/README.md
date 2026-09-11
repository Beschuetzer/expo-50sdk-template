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
