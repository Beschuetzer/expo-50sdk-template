import { getBackendHealth } from './api';

jest.mock('@/utils/helpers', () => ({
  getBackendUrl: jest.fn(() => 'http://localhost:4200'),
}));

describe('backend API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the health response', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', service: 'api' }), {
        status: 200,
      }),
    );

    await expect(getBackendHealth()).resolves.toEqual({
      service: 'api',
      status: 'ok',
    });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4200/health');
  });

  it('throws when the backend returns an error', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ status: 'error' }), { status: 503 }),
      );

    await expect(getBackendHealth()).rejects.toThrow('HTTP 503');
  });
});
