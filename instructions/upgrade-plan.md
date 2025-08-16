Upgrade plan (current SDK 50):

Determine target SDK: SDK 53

Read breaking changes: Compare SDK 50→51, 51→52 (→53) release notes; list any removed APIs you use (camera, notifications, router changes, permissions).

Core command: npx expo upgrade (Runs version bump + aligns most Expo modules.)

Align native modules (after upgrade): npx expo install expo-router npx expo install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context react-native-svg @react-native-async-storage/async-storage @react-native-community/netinfo @react-native-picker/picker (Let Expo choose compatible versions.)

Update non-managed deps:

@gorhom/bottom-sheet: pick version matching new Reanimated / RN (check its release notes).
native-base: update to latest supporting new RN; run its patch instructions (may need reanimated plugin config in babel).
react-native-paper: ensure version compatible with new RN (may require upgrade).
redux, react-query, lodash etc. unaffected.
Reanimated config: Ensure babel.config.js still has plugin 'react-native-reanimated/plugin' last. After upgrade run: npx expo start -c to rebuild cache.

TypeScript/Jest:

Update typescript to latest minor (>=5.4 if supported).
Update jest-expo to matching SDK version (e.g. ~52.x).
Run tests; fix any environment / transformer warnings.
Expo Router: Upgrade to latest (v3.x or newer). Check for changes to typedRoutes / file naming; run npx expo prebuild if any plugin suggests.

Permissions:

DETECT_SCREEN_CAPTURE may be included in stock client by a future SDK; test if still needed.
Re-validate camera/media/location permission strings (some moved to plugin config only).
Android / iOS build:

Delete previous android & ios folders if you use prebuild; run npx expo prebuild after upgrading if you need config plugin native sync.
Rebuild dev client: eas build --profile development --platform android (and iOS if applicable).
Cleanup deprecated:
util.isArray deprecation originates in a dependency; after upgrades verify it disappears.
Verify no direct imports from deprecated expo-modules or legacy unimodules.
QA checklist:
Start app (dev client) Android & iOS.
Camera, image picker, media library flows.
Location permission flows.
Notifications (ask permission & schedule).
Barcode scanner performance.
Reanimated driven components (bottom sheet, gestures).
Router deep links (scheme: myapp://).
CI / Scripts:
Update any EAS build profiles if SDK constraints change.
Lockfile commit after upgrade.
Rollback prep:
Create git branch (upgrade/sdk-XX).
Commit before/after to allow bisect if issues.
Follow-ups:
Address any new lint/ts warnings.
Update README with new SDK number.
If you want, next step: I can draft precise version targets once you confirm which SDK (latest shown on your end). Provide chosen target SDK and I’ll produce concrete version list + file edits.