Resolved: The mobile home screen now exposes a localized Sign Out action that
clears the native/BFF session, persisted query cache, and in-memory user state.

Token exchange accepts any numeric expires_in, including invalid values such as NaN, and does not verify the provider’s token_type response. The current provider is controlled and always returns the expected bearer token, so this is not currently exploitable, but stricter validation would improve robustness.

The app does not decode or locally verify the JWT. That is normally correct because the API is the resource server and performs JWT validation.