import { getBackendHealth } from './api';

jest.mock('@/utils/helpers', () => ({
  getBackendUrl: jest.fn(() => 'http://localhost:4200'),
}));

function makeResponse(body: unknown, status: number): Response {
  return {
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
  } as Response;
}

describe('backend API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the health response', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(makeResponse({ status: 'ok', service: 'api' }, 200));

    await expect(getBackendHealth()).resolves.toEqual({
      service: 'api',
      status: 'ok',
    });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4200/health');
  });

  it('throws when the backend returns an error', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(makeResponse({ status: 'error' }, 503));

    await expect(getBackendHealth()).rejects.toThrow('HTTP 503');
  });
});
