Resolved: Native sessions now store rotating refresh tokens in SecureStore and
refresh expired access tokens. Web sessions use an HttpOnly refresh cookie
through the API BFF. Refresh tokens are single-use and expire after 30 days in
the development identity provider.
There is no visible user logout action in the mobile UI; logout exists as clearAuthenticatedSession() but is currently used primarily after failed authenticated requests.
Token exchange accepts any numeric expires_in, including invalid values such as NaN, and does not verify the provider’s token_type response. The current provider is controlled and always returns the expected bearer token, so this is not currently exploitable, but stricter validation would improve robustness.
The app does not decode or locally verify the JWT. That is normally correct because the API is the resource server and performs JWT validation.