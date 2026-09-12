import {
  createIdentityProviderDiscovery,
  exchangeAuthorizationCode,
  exchangeAuthorizationCodeForCurrentPlatform,
  getAuthenticatedUser,
  verifyAuthenticatedEndpointRejectsAnonymousRequest,
} from './client';

jest.mock('@/utils/helpers', () => ({
  getBackendUrl: jest.fn(() => 'http://localhost:4200'),
}));

jest.mock('@/utils/platform', () => ({
  getIdentityProviderUrl: jest.fn(() => 'http://localhost:4300'),
}));

function makeResponse(body: unknown, status: number): Response {
  return {
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
  } as Response;
}

describe('auth client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds identity-provider discovery endpoints', () => {
    expect(createIdentityProviderDiscovery()).toEqual({
      authorizationEndpoint: 'http://localhost:4300/authorize',
      tokenEndpoint: 'http://localhost:4300/token',
    });
  });

  it('sends the bearer token to the authenticated endpoint', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        makeResponse({ claims: { sub: 'user-1' }, subject: 'user-1' }, 200),
      );

    await expect(getAuthenticatedUser('access-token')).resolves.toEqual({
      claims: { sub: 'user-1' },
      subject: 'user-1',
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4200/api/v1/me', {
      headers: { Authorization: 'Bearer access-token' },
    });
  });

  it('uses the BFF cookie for web authenticated requests', async () => {
    Object.defineProperty(require('react-native'), 'Platform', {
      configurable: true,
      value: { OS: 'web' },
    });
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        makeResponse({ claims: { sub: 'web-user' }, subject: 'web-user' }, 200),
      );

    await expect(getAuthenticatedUser('unused')).resolves.toEqual({
      claims: { sub: 'web-user' },
      subject: 'web-user',
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4200/api/v1/me', {
      credentials: 'include',
    });
  });

  it('uses default claims and subject values when the response omits them', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeResponse({}, 200));

    await expect(getAuthenticatedUser('access-token')).resolves.toEqual({
      claims: {},
      subject: null,
    });
  });

  it('rejects authenticated endpoint errors', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        makeResponse({ message: 'Authentication is required.' }, 401),
      );

    await expect(getAuthenticatedUser('expired-token')).rejects.toThrow(
      'Authentication is required.',
    );
  });

  it('exchanges an authorization code for a bearer token', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeResponse(
        {
          access_token: 'new-access-token',
          expires_in: 3600,
          scope: 'openid profile',
        },
        200,
      ),
    );

    await expect(
      exchangeAuthorizationCode({
        code: 'auth-code',
        codeVerifier: 'challenge',
        discovery: {
          authorizationEndpoint: 'http://localhost:4300/authorize',
          tokenEndpoint: 'http://localhost:4300/token',
        },
        redirectUri: 'exp://localhost:19000',
      }),
    ).resolves.toEqual({
      accessToken: 'new-access-token',
      expiresAt: expect.any(Number),
      scope: 'openid profile',
      tokenType: 'Bearer',
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:4300/token', {
      body: expect.stringContaining('code=auth-code'),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
  });

  it('rejects token exchange failures with the identity-provider error message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeResponse(
        {
          error: 'invalid_grant',
          error_description: 'The code is expired.',
        },
        400,
      ),
    );

    await expect(
      exchangeAuthorizationCode({
        code: 'expired-code',
        codeVerifier: 'challenge',
        discovery: {
          authorizationEndpoint: 'http://localhost:4300/authorize',
          tokenEndpoint: 'http://localhost:4300/token',
        },
        redirectUri: 'exp://localhost:19000',
      }),
    ).rejects.toThrow('The code is expired.');
  });

  it('uses the BFF for web authorization-code exchange', async () => {
    Object.defineProperty(require('react-native'), 'Platform', {
      configurable: true,
      value: { OS: 'web' },
    });
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        makeResponse({ expires_in: 3600, scope: 'openid api:read' }, 200),
      );

    await expect(
      exchangeAuthorizationCodeForCurrentPlatform({
        code: 'auth-code',
        codeVerifier: 'challenge',
        discovery: { authorizationEndpoint: 'http://localhost:4300/authorize' },
        redirectUri: 'http://localhost:8081/oauth/callback',
      }),
    ).resolves.toEqual({
      accessToken: '',
      expiresAt: expect.any(Number),
      scope: 'openid api:read',
      tokenType: 'Bearer',
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4200/auth/token', {
      body: expect.any(URLSearchParams),
      credentials: 'include',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
  });

  it('reports BFF exchange failures without an upstream description', async () => {
    Object.defineProperty(require('react-native'), 'Platform', {
      configurable: true,
      value: { OS: 'web' },
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(makeResponse({}, 502));

    await expect(
      exchangeAuthorizationCodeForCurrentPlatform({
        code: 'auth-code',
        codeVerifier: 'challenge',
        discovery: { authorizationEndpoint: 'http://localhost:4300/authorize' },
        redirectUri: 'http://localhost:8081/oauth/callback',
      }),
    ).rejects.toThrow('Token exchange failed with HTTP 502');
  });

  it('requires a token endpoint before exchanging codes', async () => {
    await expect(
      exchangeAuthorizationCode({
        code: 'auth-code',
        codeVerifier: 'challenge',
        discovery: { authorizationEndpoint: 'http://localhost:4300/authorize' },
        redirectUri: 'exp://localhost:19000',
      }),
    ).rejects.toThrow(
      'The identity provider does not publish a token endpoint.',
    );
  });

  it('verifies anonymous requests are rejected with HTTP 401', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(makeResponse({ status: 'unauthorized' }, 401));

    await expect(
      verifyAuthenticatedEndpointRejectsAnonymousRequest(),
    ).resolves.toBe(401);
    expect(fetch).toHaveBeenCalledWith('http://localhost:4200/api/v1/me');
  });

  it('fails the security check when an anonymous request is accepted', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(makeResponse({ status: 'ok' }, 200));

    await expect(
      verifyAuthenticatedEndpointRejectsAnonymousRequest(),
    ).rejects.toThrow('returned HTTP 200');
  });
});
