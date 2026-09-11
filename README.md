## Expo 50 Nx Starter Monorepo

A neutral Expo SDK 50 starter shell managed by Nx, with a minimal Node.js backend for local development.

## Projects

- `mobile`: Expo Router app in `apps/mobile`, preserving the existing Expo SDK 50 and gluestack UI v1 setup.
- `api`: dependency-free Node HTTP service in `apps/api`.

The API currently exposes `GET /health` on port `4200` and returns a JSON health response.

## Local Development

Install dependencies once:

```bash
npm install
```

Start Expo and the backend together:

```bash
npm run dev
```

Start either project independently:

```bash
npm run api
npm run mobile
```

The mobile app's `Test Backend Connection` button calls the API health endpoint. `apps/mobile/setup.mjs` refreshes the Expo public IP and backend port in `apps/mobile/.env` before Metro starts. For a physical device, the generated IP must be reachable from the device.

## Nx Commands

```bash
npx nx show projects
npx nx run mobile:typecheck
npx nx run api:typecheck
npx nx build api
npm run typecheck
npm run validate:startup
```

## Mobile Testing

The mobile Jest setup remains under `apps/mobile` and can be run through Nx:

```bash
npm test
npm run test:coverage
```

## Production API Configuration

The local API defaults to `HOST=0.0.0.0` and `PORT=4200`. Override either value when serving the API directly:

```powershell
$env:PORT=4300; npm run api
```