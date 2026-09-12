import {
  createIdentityProviderDiscovery,
  getAuthenticatedUser,
  verifyAuthenticatedEndpointRejectsAnonymousRequest,
} from './client';

jest.mock('@/utils/helpers', () => ({
  getBackendUrl: jest.fn(() => 'http://localhost:4200'),
}));

jest.mock('@/utils/platform', () => ({
  getIdentityProviderUrl: jest.fn(() => 'http://localhost:4300'),
}));

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
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ claims: { sub: 'user-1' }, subject: 'user-1' }), {
        status: 200,
      }),
    );

    await expect(getAuthenticatedUser('access-token')).resolves.toEqual({
      claims: { sub: 'user-1' },
      subject: 'user-1',
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4200/api/v1/me', {
      headers: { Authorization: 'Bearer access-token' },
    });
  });

  it('rejects authenticated endpoint errors', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Authentication is required.' }), {
        status: 401,
      }),
    );

    await expect(getAuthenticatedUser('expired-token')).rejects.toThrow(
      'Authentication is required.',
    );
  });

  it('verifies anonymous requests are rejected with HTTP 401', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401 }),
    );

    await expect(
      verifyAuthenticatedEndpointRejectsAnonymousRequest(),
    ).resolves.toBe(401);
    expect(fetch).toHaveBeenCalledWith('http://localhost:4200/api/v1/me');
  });

  it('fails the security check when an anonymous request is accepted', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    );

    await expect(
      verifyAuthenticatedEndpointRejectsAnonymousRequest(),
    ).rejects.toThrow('returned HTTP 200');
  });
});
