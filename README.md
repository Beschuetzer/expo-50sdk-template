## Expo 50 Nx Starter Monorepo

A neutral Expo SDK 50 starter shell managed by Nx, with a minimal Node.js backend for local development.

## Projects

- `mobile`: Expo Router app in `apps/mobile`, preserving the existing Expo SDK 50 and gluestack UI v1 setup.
- `api`: dependency-free Node HTTP service in `apps/api`.

The API currently exposes `GET /health` on port `4200` and returns a JSON health response.

## Mobile Architecture

Mobile code is organized by responsibility:

- `app`: Expo Router screens and navigation composition.
- `features`: product capabilities with their API functions, query hooks, and feature tests.
- `components`: reusable UI, domain-independent hooks, and shared services.
- `state`: Redux slices for client state and the shared TanStack Query client configuration.
- `utils`: cross-cutting concerns such as internationalization, theme resolution, storage, and platform helpers.

For a server-backed feature, keep the request function in
`apps/mobile/features/<feature>/api.ts`, the cache hook in
`apps/mobile/features/<feature>/hooks`, and consume the hook from a screen or
feature component. This keeps screens focused on rendering and user actions.

### Redux and TanStack Query boundaries

Redux is for client state that the application owns, such as form values,
preferences, authentication state, and UI flags. TanStack Query is for remote
server state, including request status, stale data, retries, invalidation, and
cache lifetimes. Do not copy query results into Redux; doing so creates two
sources of truth and removes much of TanStack Query's value.

The singleton QueryClient in `apps/mobile/state/queryClient.ts` persists its
cache through AsyncStorage and is mounted by `PersistQueryClientProvider` in
the root layout. Redux Persist uses the same storage mechanism for client
state, but the two persisted stores remain separate and independently
versioned.

The starter home screen includes cache verification controls. Press `Test
Backend Connection` to fetch and cache the health response, `Read Cached
Health` to inspect that response without a network request, and `Clear Backend
Cache` to remove it. Reading the cache after clearing should report a cache
miss.

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

The normal mobile command runs Expo directly via `npm --prefix apps/mobile`
instead of Nx, so Expo Go's QR code and interactive keyboard shortcuts (`a`,
`w`, `r`, `?`, etc.) work reliably on Windows terminals. To force a clean Metro
rebuild when troubleshooting, run:

```bash
npm --prefix apps/mobile run dev:clear
```

The mobile app's `Test Backend Connection` button calls the API health endpoint. `apps/mobile/setup.mjs` refreshes the Expo public IP and backend port in `apps/mobile/.env` before Metro starts. For a physical device, the generated IP must be reachable from the device.

The mobile template includes a typed i18n provider with English and Spanish
starter translations. The device locale selects the initial language, and the
language selector in the Settings tab persists the user's choice with
AsyncStorage. Add new messages in `apps/mobile/utils/i18n.tsx` and reference
them with `useI18n().t('section.key')` instead of hard-coding user-facing text.

Theme support is provided by `apps/mobile/utils/theme.tsx`. The Settings tab
allows users to choose System, Light, or Dark mode, and the choice is persisted
with AsyncStorage. The selected mode is shared by React Navigation, Gluestack,
the tab bar, and legacy themed components. Use `useColorScheme()` or
`useThemeMode()` for theme-aware behavior, and avoid fixed light-only colors in
new screens.

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