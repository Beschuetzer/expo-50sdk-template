## Template focus
This project is a neutral Expo SDK 50 starter shell with a reusable app foundation and a few sample-domain examples layered on top. It is intentionally structured so you can keep the architecture and replace the example content with your own product flow.

The app-specific pieces are not the default starting point anymore. The default screen is a generic home view and the default settings screen is a blank starter layout, so the repo reads more like a clean shell than a task manager.

## Sample domain still present
The repo still contains a few app-specific examples that are useful as reference material:
- task and list patterns
- scanner and barcode examples
- share-intent and image workflows
- account sync and persistence patterns

These should be treated as optional sample modules rather than the core template structure.

## Reusable shell patterns
- Expo Router stack and modal scaffolding
- Redux Toolkit slices + persisted state setup
- gluestack UI component conventions
- shared hooks, constants, and utility helpers
- testing and startup validation conventions

## Minimal generic app-shell example
If you want a simpler starter for a non-task app, keep the shell and replace the example domain with a single-screen or feature-first flow:

- keep: `app/_layout.tsx`, `state/`, `constants/`, `components/`, and `utils/`
- replace: task screens, task tiles, task forms, and scanner/share-intent flows with your own domain objects
- rename the sample route names and update the app entry so the template reads as a blank shell instead of a task manager

A good baseline pattern is:
- root layout with the provider stack
- one home screen + one modal screen
- a single Redux slice for app state
- one or two reusable shared components

## Startup validation
Before local startup, run:

```bash
npm run validate:startup
```

This checks for missing required packages, empty or invalid app config assumptions, and implied template-domain drift (for example, app-specific plugins that may need review before repurposing).

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