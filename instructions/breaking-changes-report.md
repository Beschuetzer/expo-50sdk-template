# Breaking Changes Report: Expo SDK 50 → 53

Target upgrade path: 50 → 51 → 52 → 53 (latest chosen SDK 53)

This report highlights breaking / notable changes relevant to the libraries actually used in this project (camera, notifications, router, media/assets, gestures/reanimated, permissions, build tooling). It focuses on items that typically require code, config, or workflow adjustments. Always verify exact release notes once SDK 53 is officially confirmed on your timeline.

---
## Summary Table
| Area | 50→51 | 51→52 | 52→53 | Action Needed |
|------|-------|-------|-------|---------------|
| React Native Core | RN 0.73 → 0.74 (Hermes default updates) | RN 0.74 → 0.75 (TurboModule infra advances) | RN 0.75 → 0.76 (possible Fabric defaulting) | Re‑test custom polyfills, ensure clean caches |
| Android Target / Gradle | Bump targetSdk (Android 14) enforced in 51 | Gradle / AGP minor bump | Further AGP/JDK alignment | Clear gradle caches (prebuild) + re-run EAS builds |
| Permissions (Android 14) | New runtime / manifest needs (POST_NOTIFICATIONS earlier, DETECT_SCREEN_CAPTURE emerges) | Scoped storage tightening | Possible inclusion of DETECT_SCREEN_CAPTURE in Expo Go later | Keep DETECT_SCREEN_CAPTURE in dev client until stock includes it |
| expo-router | v3 minor updates (50 baseline) / typedRoutes stabilized | File conventions tightening; more warnings for invalid layout segments | Potential new metadata APIs & improved typed routes generation | Re-run `npx expo install expo-router` & revalidate `_layout.tsx` |
| expo-camera | Minor deprecations (legacy constants) | Aligns with new RN camera permission flows | Potential prop renames / viewfinder optimizations | Audit usage for removed constants / types |
| expo-image-picker / media-library | iOS permission string enforcement; Android storage rationale | Scoped storage enforcement, deprecates legacy result fields | Potential removal of deprecated options | Remove deprecated fields (e.g. `cancelled` vs `canceled` adjustments if any) |
| expo-notifications | Background handler registration changes clarified | Android notification channel creation stricter (must specify importance) | Potential default channel behavior change | Explicitly create channels on Android at startup |
| Reanimated / Gesture Handler | Reanimated 3.x updates; plugin required last | Sync with RN 0.75 requiring patch versions | Fabric enablement adjustments | Keep babel plugin last; update versions via expo install |
| Async Storage / NetInfo / Picker | Version alignment only | Same | Same | No code change expected |
| EAS Build Config | Node / JDK image updates | Xcode / NDK updates | More runtime constraints | Update build profiles if pinned images |
| jest-expo / testing | jest-expo 50.x → 51.x (new transforms) | 51.x → 52.x (ESM tweaks) | 52.x → 53.x (possible RN Jest preset changes) | Upgrade jest-expo in lockstep, clear cache |
| Expo CLI | `expo upgrade` updates config plugins | Additional warnings for legacy config | Potential removal of deprecated commands | Use latest CLI before upgrade |

---
## Detailed Notes & Required Actions

### 1. React Native Upgrades (0.73 → 0.76)
Potential impacts:
- New Metro transformer changes; clear caches (`expo start -c`).
- If any polyfills (none obvious here) relying on deprecated Node core shims, confirm they still work.
- util.isArray deprecation warning likely disappears when dependencies update; no code change required.
Action: After each step, run app and execute core flows (navigation, camera, image pick, barcode scan).

### 2. Android Target & Permissions
- Android 14 target becomes mandatory; runtime behavior around foreground services & exact alarms (not used here) tightened.
- DETECT_SCREEN_CAPTURE required for screenshot observer; remain in manifest until confirmed redundant in SDK 53.
Action: Keep permission. Rebuild dev client post-upgrade.

### 3. expo-router
- Validate `_layout.tsx` still conforms; v3 may tighten segment conventions (no change needed if using standard layout).
- typedRoutes experiment may become stable; if config key changes, remove `experiments.typedRoutes` once docs indicate.
Action: After upgrade run: `npx expo start -c` then check for router warnings.

### 4. expo-camera / barcode-scanner
- Occasional deprecations of static constants or event field names.
- Verify usage of `BarCodeScanner` vs `expo-barcode-scanner`; ensure permission request flows unchanged.
Action: Search for any deprecated constants (e.g. `Camera.Constants.Type`). Update per docs if warned.

### 5. expo-image-picker & expo-media-library
- Ensure you rely on `canceled` property spelling (Expo standardized); adapt if still using older alias.
- Check any usage of deprecated options: `allowsEditing`, `aspect` still supported; if warnings appear, adjust.
Action: Run flows; if warnings appear, patch code.

### 6. expo-notifications
- Android channels: Always create explicit channel before scheduling / displaying (if not already). If currently relying on defaults, add:
```ts
import * as Notifications from 'expo-notifications';
Notifications.setNotificationChannelAsync('default', { name: 'Default', importance: Notifications.AndroidImportance.DEFAULT });
```
- Background handlers require registration at import time; ensure no conditional dynamic import that delays it.
Action: Audit notification initialization (not visible yet) before upgrade—add if missing.

### 7. Reanimated / Gesture Handler / Bottom Sheet
- Keep Babel plugin order: reanimated plugin LAST.
- @gorhom/bottom-sheet must match reanimated & gesture-handler versions; upgrade after running `expo upgrade` then: `npx expo install react-native-reanimated react-native-gesture-handler` and manually bump bottom-sheet if peer warnings.
Action: After dependency alignment, run `npx expo start -c`. Validate gestures and bottom sheet interactions.

### 8. TypeScript / Jest
- Upgrade `jest-expo` in lockstep (e.g. `~53.x` when available).
- If ESM transformation changes cause test failures (unexpected token), adjust Jest config (transformIgnorePatterns) — rarely needed with latest preset.
Action: Run `npm test` after each SDK jump.

### 9. Config Plugins & app.json
- If `experiments.typedRoutes` becomes unnecessary, remove it.
- Re-run `npx expo prebuild` ONLY if you already generated native folders or need to apply plugin native changes; otherwise EAS handles it at build time.
Action: Keep manifest lean; ensure no duplicate icon paths.

### 10. Dev Client Rebuild Triggers
Rebuild after: version bump, permission list change, plugin addition, SDK step. Do NOT need rebuild for JS only edits.

### 11. Rollback Strategy
- Create branch: `upgrade/sdk-53`.
- Commit after each SDK step if doing incremental (51, 52, 53) to allow bisect.
- Tag pre-upgrade commit for quick revert.

### 12. Post-Upgrade QA Checklist (Project-Specific)
- Inventory CRUD + persistence (redux-persist & state rehydration).
- Image capture & display (expo-camera + expo-image + media-library).
- Barcode scanning performance.
- Location-based store creation (expo-location permission prompts).
- Notifications scheduling (if implemented; otherwise add smoke test or skip).
- Router navigation across all tabs/modals (ensure modals still present correctly with Gesture Handler).

### 13. Potential Code Adjustments (Anticipated)
| Module | Potential Change | Mitigation |
|--------|------------------|-----------|
| expo-router | Removal of experimental flag | Remove `experiments.typedRoutes` if warned |
| expo-camera | Deprecated constants warning | Replace with new enums per docs |
| expo-notifications | Channel importance required | Create channel before scheduling |
| expo-image-picker | Property rename normalization | Update result property usage |
| react-native-reanimated | Babel plugin ordering strict | Keep plugin last in `babel.config.js` |

### 14. Commands Sequence (Concrete)
```bash
# 1. Branch
git checkout -b upgrade/sdk-53

# 2. Upgrade to latest
npx expo upgrade

# 3. Align key native deps (lets Expo pick versions)
npx expo install expo-router react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context react-native-svg @react-native-async-storage/async-storage @react-native-community/netinfo @react-native-picker/picker

# 4. Manually update other libs if peer warnings
npm i @gorhom/bottom-sheet@latest native-base@latest react-native-paper@latest

# 5. Jest / TS alignment
npm i -D jest-expo@latest typescript@latest

# 6. Clear caches & start
npx expo start -c

# 7. Run tests
npm test

# 8. Build updated dev client (Android)
eas build --profile development --platform android

# 9. Commit
git add . && git commit -m "chore: upgrade to Expo SDK 53"
```

### 15. Open Questions (Verify in Official Release Notes)
- Whether Fabric is on by default in SDK 53 (affects Reanimated performance & potential layout warnings).
- Any removal timeline for legacy permission keys inside `app.json` vs plugin-only configuration.

---
## Action Items Before Running `expo upgrade`
1. Ensure clean working tree (`git status` empty).
2. Confirm you have a recent backup or tag.
3. Decide if incremental upgrades (50→51→52→53) are needed; typically direct jump is fine but incremental can isolate issues.

## After Upgrade—If Errors Occur
- Metro build failure referencing native module: run `rm -rf node_modules && npm install && expo start -c` (Windows: delete node_modules manually).
- Android build failure about missing permission: ensure `android.permissions` still includes custom entries.
- Gesture handler invariant: confirm you reinstalled matching versions and imported GestureHandlerRootView where needed.

---
Generated based on typical Expo SDK progression and your current dependency set. Adjust with concrete release note specifics once SDK 53 documentation is in hand.
