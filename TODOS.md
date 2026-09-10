# Template Review TODOs

## High priority

- Add a real `.env.example` and centralized environment validation for required values such as `EXPO_PUBLIC_IP_ADDRESS`, `EXPO_PUBLIC_PORT_NUMBER`, and `EXPO_PUBLIC_ENV`.


## Medium priority

- Replace the `@ts-ignore` router parameter workarounds with properly typed route params to reduce TypeScript debt and keep the Expo Router pattern clean.
- Review the persisted Redux root state to ensure only serializable, app-safe data is saved. Large or non-serializable blobs should be excluded from persistence.
- Audit deps in `package.json` for unused or template-specific packages such as `expo-camera`, `expo-share-intent`, and other app-domain libraries that are not required by the generic shell.
- Add a simple template-level README section that clearly separates the app-specific sample domain from reusable architecture patterns.

## Nice-to-have / future upgrades

- Evaluate upgrading from gluestack v1 to the current v2/v5 API if desired, but only after validating the migration cost and keeping the Expo 50 compatibility target intact.
- Introduce a small developer tool or script to validate config, env, and missing package assumptions before local startup.
- Consider a minimal app-shell example that is more generic than the current task-based implementation to make the template easier to repurpose.

## Observations

- The repo is in good shape for an Expo SDK 50 template from a dependency and build perspective.
- The main remaining risk is architectural debt: one large helper file, a large thunk file, and a lot of app-specific assumptions are still present.
- The app still reads as a domain-specific task app more than a true blank starter template, which is fine for a sample app but worth separating clearly for future reuse.
