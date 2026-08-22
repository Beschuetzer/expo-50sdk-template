import {
  BFF_SERVICE,
  STORE_PATH,
} from '@/components/services/BffService';
import { Route } from '@/types/Store';

// BffService -> AbstractService -> generalSlice -> thunks -> GeoCodingService
// -> AbstractService forms a circular import chain (a pre-existing condition
// in the codebase). Stubbing this out avoids a "Super expression must either
// be null or a function" error caused by the cycle under Jest's CJS interop.
jest.mock('@/components/services/GeoCodingService', () => ({
  GEO_CODING_SERVICE: {},
}));

function makeRoute(overrides: Partial<Route> = {}): Route {
  return {
    id: 'route-1',
    name: 'Main Route',
    storeId: 'store-1',
    locations: ['Produce', 'Dairy'],
    userId: 'user-1',
    userIdsWithAccess: [],
    ...overrides,
  };
}

function mockFetchResponse(body: unknown, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BFF_SERVICE.saveStoreRoutes', () => {
  it('saves routes for a store and returns the response', async () => {
    const dispatch = jest.fn();
    const routes = [makeRoute()];
    mockFetchResponse(routes);

    const result = await BFF_SERVICE.saveStoreRoutes({
      storeId: 'store-1',
      routes,
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toEqual(routes);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`${STORE_PATH}/routes`);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      storeId: 'store-1',
      routes,
      userId: 'user-1',
      password: 'password123',
    });
  });

  it('does not call the network and dispatches an error when credentials are missing', async () => {
    const dispatch = jest.fn();

    const result = await BFF_SERVICE.saveStoreRoutes({
      storeId: 'store-1',
      routes: [],
      dispatch,
      userId: '',
      password: '',
    });

    expect(result).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'general/setError' }),
    );
  });

  it('does not call the network and dispatches an error when no storeId is given', async () => {
    const dispatch = jest.fn();

    const result = await BFF_SERVICE.saveStoreRoutes({
      storeId: '',
      routes: [],
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'general/setError' }),
    );
  });
});

describe('BFF_SERVICE.getStoreRoutes', () => {
  it('downloads routes for a store and returns the response', async () => {
    const dispatch = jest.fn();
    const routes = [makeRoute()];
    mockFetchResponse(routes);

    const result = await BFF_SERVICE.getStoreRoutes({
      storeId: 'store-1',
      dispatch,
    });

    expect(result).toEqual(routes);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`${STORE_PATH}/routes/store-1`);
    expect(options.method ?? 'GET').toBe('GET');
  });

  it('does not call the network and dispatches an error when no storeId is given', async () => {
    const dispatch = jest.fn();

    const result = await BFF_SERVICE.getStoreRoutes({
      storeId: '',
      dispatch,
    });

    expect(result).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'general/setError' }),
    );
  });
});

describe('BFF_SERVICE.deleteStoreRoutes', () => {
  it('deletes the given route ids for a store and returns the response', async () => {
    const dispatch = jest.fn();
    const remainingRoutes = [makeRoute({ id: 'route-2' })];
    mockFetchResponse(remainingRoutes);

    const result = await BFF_SERVICE.deleteStoreRoutes({
      storeId: 'store-1',
      ids: ['route-1'],
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toEqual(remainingRoutes);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`${STORE_PATH}/routes`);
    expect(options.method).toBe('DELETE');
    expect(JSON.parse(options.body)).toEqual({
      storeId: 'store-1',
      ids: ['route-1'],
      userId: 'user-1',
      password: 'password123',
    });
  });

  it('does not call the network and dispatches an error when credentials are missing', async () => {
    const dispatch = jest.fn();

    const result = await BFF_SERVICE.deleteStoreRoutes({
      storeId: 'store-1',
      ids: ['route-1'],
      dispatch,
      userId: '',
      password: '',
    });

    expect(result).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not call the network and dispatches an error when no storeId is given', async () => {
    const dispatch = jest.fn();

    const result = await BFF_SERVICE.deleteStoreRoutes({
      storeId: '',
      ids: ['route-1'],
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'general/setError' }),
    );
  });

  it('does not call the network and dispatches an error when no ids are given', async () => {
    const dispatch = jest.fn();

    const result = await BFF_SERVICE.deleteStoreRoutes({
      storeId: 'store-1',
      ids: [],
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'general/setError' }),
    );
  });
});
