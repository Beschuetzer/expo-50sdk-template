## Template focus
This project is a sample Expo app shell with a task-management domain layered on top. It is intentionally not a blank canvas: it demonstrates Redux slices, Expo Router screens, forms, persistence, shared UI patterns, and a simple backend integration flow.

If you are reusing this repo as a starter, keep the reusable architecture and replace the task domain pieces with your own domain model. The app-specific parts are the task-oriented screens, state, and sample data flows.

## App-specific sample domain
- task lists and task tiles
- scanning and QR/barcode flows
- a BFF sync pattern for account + task persistence
- share-intent and image workflow examples tied to task data

## Reusable shell patterns
- Expo Router stack and modal scaffolding
- Redux Toolkit slices + persisted state setup
- gluestack UI component conventions
- shared hooks, constants, and utility helpers
- testing and startup setup conventions

## Gotchas
- When running `npm start` check to make sure that metro isn't using expo build.  Should be able to press `s` to switch.
- The backend ip address is hard-coded and needs to match the value for the machine on which the local instance of the bff is running (use `ipconfig`)

## How to Build App
- https://docs.expo.dev/build/setup/
- run `npm run build:preview` (only 30 free builds per month though)

## Development Client (Custom Expo Dev Build)
Use this when features require native permissions or modules not available in stock Expo Go (e.g. Android 14 `DETECT_SCREEN_CAPTURE`).

### One-time Setup / Build
1. Ensure `expo-dev-client` is in dependencies (already present).
2. Add any needed Android/iOS permissions in `app.json` (e.g. `android.permission.DETECT_SCREEN_CAPTURE`).
3. Build and install the dev client on your device:
   - Android: `eas build --profile development --platform android`
   - (Or locally: `npx expo run:android` after `npx expo prebuild`.)
4. Install the produced .apk/.aab on the test device.

### Daily Development
- Start with: `npm run start:dev` (runs `expo start --dev-client`).
- Open the dev client app on device; it will connect to the Metro bundler and support fast refresh. No rebuild needed for JS/TS changes.

### When You MUST Rebuild the Dev Client
Rebuild only after changes that modify native code/manifest:
- Adding/removing Expo or React Native native modules (packages with native code).
- Changing permissions, icons, splash, app name, bundle ID / package name.
- Editing `android` or `ios` sections of `app.json` / `app.config.*`.
- Upgrading Expo SDK or React Native version.
- Adding config plugins or changing plugin configuration.

JS/TS, assets (in the bundler), styles, or business logic changes do NOT require a rebuild.

### Troubleshooting
- If the dev client fails to load: clear cache `expo start -c`.
- If you see a native permission crash on Android 14: verify the permission is in `app.json` and that you rebuilt after adding it.
- If runtime says component not registered: usually an earlier native module initialization error—check the first red error.

## Recovering from Corrupt Redux State
- try flushing the persistor
- re-install Expo Go or Dev Client
- fix and re-test the problem