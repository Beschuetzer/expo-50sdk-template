import { configureStore } from '@reduxjs/toolkit';

import generalReducer, { generalSlice } from './slices/generalSlice';
import listsReducer, { listsSlice } from './slices/listsSlice';
import { saveStoreRoutes, getStoreRoutes, deleteStoreRoutes } from './thunks';

import { BFF_SERVICE } from '@/components/services/BffService';
import { Route, Store } from '@/types/Store';
import { UserAccount } from '@/types/bffService';

// jest-setup.ts globally stubs listsSlice with just `{ ListName }` so other
// tests that don't need the real reducer avoid pulling in native-touching
// dependencies. Override that here since these tests need the real reducer.
jest.mock('./slices/listsSlice', () =>
  jest.requireActual('./slices/listsSlice'),
);

jest.mock('@/components/services/BffService', () => ({
  BFF_SERVICE: {
    saveStoreRoutes: jest.fn(),
    getStoreRoutes: jest.fn(),
    deleteStoreRoutes: jest.fn(),
  },
}));

const mockedBffService = BFF_SERVICE as unknown as {
  saveStoreRoutes: jest.Mock;
  getStoreRoutes: jest.Mock;
  deleteStoreRoutes: jest.Mock;
};

const defaultGeneralState = generalReducer(undefined, { type: '@@INIT' });
const defaultListsState = listsReducer(undefined, { type: '@@INIT' });

const DEFAULT_ACCOUNT: UserAccount = {
  _id: 'user-1',
  email: 'user@example.com',
  password: 'password123',
};

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

function makeStoreRecord(overrides: Partial<Store> = {}): Store {
  return {
    _id: 'store-1',
    name: 'Store 1',
    routes: [],
    needsSaving: false,
    hasBeenSaved: true,
    addedDate: Date.now(),
    ...overrides,
  } as Store;
}

function makeTestStore(
  options: {
    stores?: Store[];
    activeRouteIds?: Record<string, string | null>;
    account?: Partial<UserAccount> | null;
  } = {},
) {
  const {
    stores = [],
    activeRouteIds = {},
    account = DEFAULT_ACCOUNT,
  } = options;

  return configureStore({
    reducer: {
      [generalSlice.name]: generalReducer,
      [listsSlice.name]: listsReducer,
    },
    preloadedState: {
      [generalSlice.name]: {
        ...defaultGeneralState,
        account: account
          ? { ...DEFAULT_ACCOUNT, ...account }
          : defaultGeneralState.account,
      },
      [listsSlice.name]: {
        ...defaultListsState,
        activeRouteIds,
        storesList: {
          ...defaultListsState.storesList,
          data: stores,
        },
      },
    } as any,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('saveStoreRoutes', () => {
  it('adds a new route locally and persists the full updated routes list', async () => {
    const store = makeTestStore({ stores: [makeStoreRecord()] });
    mockedBffService.saveStoreRoutes.mockResolvedValue([]);

    const newRoute = {
      name: 'New Route',
      locations: ['Produce'],
      storeId: 'store-1',
      userId: 'user-1',
      userIdsWithAccess: [],
    };

    const result = await store.dispatch(
      saveStoreRoutes({ storeId: 'store-1', route: newRoute as any }),
    );

    expect(result.type).toBe('saveStoreRoutes/fulfilled');
    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes).toHaveLength(1);
    expect(storedRoutes[0]).toMatchObject({
      name: 'New Route',
      storeId: 'store-1',
    });
    expect(mockedBffService.saveStoreRoutes).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        routes: storedRoutes,
      }),
    );
  });

  it('updates an existing route locally when the route id already exists', async () => {
    const existingRoute = makeRoute();
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [existingRoute] })],
    });
    mockedBffService.saveStoreRoutes.mockResolvedValue([]);

    const result = await store.dispatch(
      saveStoreRoutes({
        storeId: 'store-1',
        route: { ...existingRoute, name: 'Renamed Route' },
      }),
    );

    expect(result.type).toBe('saveStoreRoutes/fulfilled');
    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes).toHaveLength(1);
    expect(storedRoutes[0].name).toBe('Renamed Route');
  });

  it('rejects without calling the BFF service when no storeId is given', async () => {
    const store = makeTestStore();

    const result = await store.dispatch(
      saveStoreRoutes({ storeId: '' } as any),
    );

    expect(result.type).toBe('saveStoreRoutes/rejected');
    expect(mockedBffService.saveStoreRoutes).not.toHaveBeenCalled();
  });

  it('rejects without calling the BFF service when the user is not logged in', async () => {
    const store = makeTestStore({
      stores: [makeStoreRecord()],
      account: { _id: '', password: '' },
    });

    const result = await store.dispatch(
      saveStoreRoutes({ storeId: 'store-1' }),
    );

    expect(result.type).toBe('saveStoreRoutes/rejected');
    expect(mockedBffService.saveStoreRoutes).not.toHaveBeenCalled();
  });

  it('rejects when the store cannot be found', async () => {
    const store = makeTestStore({ stores: [] });

    const result = await store.dispatch(
      saveStoreRoutes({ storeId: 'nonexistent-store' }),
    );

    expect(result.type).toBe('saveStoreRoutes/rejected');
    expect(mockedBffService.saveStoreRoutes).not.toHaveBeenCalled();
  });

  it('rejects when the BFF service does not return a response', async () => {
    const store = makeTestStore({ stores: [makeStoreRecord()] });
    mockedBffService.saveStoreRoutes.mockResolvedValue(undefined);

    const result = await store.dispatch(
      saveStoreRoutes({ storeId: 'store-1' }),
    );

    expect(result.type).toBe('saveStoreRoutes/rejected');
  });
});

describe('getStoreRoutes', () => {
  it('additively adds remote-only routes to local state', async () => {
    const store = makeTestStore({ stores: [makeStoreRecord({ routes: [] })] });
    const remoteRoute = makeRoute({ id: 'remote-route' });
    mockedBffService.getStoreRoutes.mockResolvedValue([remoteRoute]);

    const result = await store.dispatch(getStoreRoutes({ storeId: 'store-1' }));

    expect(result.type).toBe('getStoreRoutes/fulfilled');
    expect((result as any).payload.conflicts).toEqual([]);
    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes).toEqual([remoteRoute]);
  });

  it('flags routes that exist both locally and remotely but differ as conflicts', async () => {
    const localRoute = makeRoute({ id: 'route-1', name: 'Local Name' });
    const remoteRoute = makeRoute({ id: 'route-1', name: 'Remote Name' });
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [localRoute] })],
    });
    mockedBffService.getStoreRoutes.mockResolvedValue([remoteRoute]);

    const result = await store.dispatch(getStoreRoutes({ storeId: 'store-1' }));

    expect(result.type).toBe('getStoreRoutes/fulfilled');
    expect((result as any).payload.conflicts).toEqual([
      { local: localRoute, remote: remoteRoute },
    ]);
    // Local state should be left untouched for conflicting routes.
    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes).toEqual([localRoute]);
  });

  it('does not flag a conflict when the local and remote routes are identical', async () => {
    const route = makeRoute();
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [route] })],
    });
    mockedBffService.getStoreRoutes.mockResolvedValue([route]);

    const result = await store.dispatch(getStoreRoutes({ storeId: 'store-1' }));

    expect((result as any).payload.conflicts).toEqual([]);
  });

  it('rejects without calling the BFF service when no storeId is given', async () => {
    const store = makeTestStore();

    const result = await store.dispatch(getStoreRoutes({ storeId: '' }));

    expect(result.type).toBe('getStoreRoutes/rejected');
    expect(mockedBffService.getStoreRoutes).not.toHaveBeenCalled();
  });

  it('rejects when the BFF service does not return an array', async () => {
    const store = makeTestStore({ stores: [makeStoreRecord()] });
    mockedBffService.getStoreRoutes.mockResolvedValue(undefined);

    const result = await store.dispatch(getStoreRoutes({ storeId: 'store-1' }));

    expect(result.type).toBe('getStoreRoutes/rejected');
  });
});

describe('deleteStoreRoutes', () => {
  it('deletes the given routes locally only after the BFF service succeeds', async () => {
    const routeToDelete = makeRoute({ id: 'route-1' });
    const otherRoute = makeRoute({ id: 'route-2', name: 'Other Route' });
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [routeToDelete, otherRoute] })],
    });
    mockedBffService.deleteStoreRoutes.mockResolvedValue([otherRoute]);

    const result = await store.dispatch(
      deleteStoreRoutes({ storeId: 'store-1', ids: ['route-1'] }),
    );

    expect(result.type).toBe('deleteStoreRoutes/fulfilled');
    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes).toEqual([otherRoute]);
    expect(mockedBffService.deleteStoreRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: 'store-1', ids: ['route-1'] }),
    );
  });

  it('supports deleting multiple routes in one call', async () => {
    const routes = [
      makeRoute({ id: 'route-1' }),
      makeRoute({ id: 'route-2' }),
      makeRoute({ id: 'route-3' }),
    ];
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes })],
    });
    mockedBffService.deleteStoreRoutes.mockResolvedValue([routes[2]]);

    await store.dispatch(
      deleteStoreRoutes({ storeId: 'store-1', ids: ['route-1', 'route-2'] }),
    );

    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes.map((r: Route) => r.id)).toEqual(['route-3']);
  });

  it('clears the active route id if it was one of the deleted routes', async () => {
    const routeToDelete = makeRoute({ id: 'route-1' });
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [routeToDelete] })],
      activeRouteIds: { 'store-1': 'route-1' },
    });
    mockedBffService.deleteStoreRoutes.mockResolvedValue([]);

    await store.dispatch(
      deleteStoreRoutes({ storeId: 'store-1', ids: ['route-1'] }),
    );

    expect(
      store.getState()[listsSlice.name].activeRouteIds['store-1'],
    ).toBeNull();
  });

  it('rejects without calling the BFF service when no ids are given', async () => {
    const store = makeTestStore({ stores: [makeStoreRecord()] });

    const result = await store.dispatch(
      deleteStoreRoutes({ storeId: 'store-1', ids: [] }),
    );

    expect(result.type).toBe('deleteStoreRoutes/rejected');
    expect(mockedBffService.deleteStoreRoutes).not.toHaveBeenCalled();
  });

  it('does not remove routes locally when the BFF service call fails', async () => {
    const routeToDelete = makeRoute({ id: 'route-1' });
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [routeToDelete] })],
    });
    mockedBffService.deleteStoreRoutes.mockResolvedValue(undefined);

    const result = await store.dispatch(
      deleteStoreRoutes({ storeId: 'store-1', ids: ['route-1'] }),
    );

    expect(result.type).toBe('deleteStoreRoutes/rejected');
    const storedRoutes =
      store.getState()[listsSlice.name].storesList.data[0].routes;
    expect(storedRoutes).toEqual([routeToDelete]);
  });

  it('rejects without calling the BFF service when the user is not logged in', async () => {
    const store = makeTestStore({
      stores: [makeStoreRecord({ routes: [makeRoute()] })],
      account: { _id: '', password: '' },
    });

    const result = await store.dispatch(
      deleteStoreRoutes({ storeId: 'store-1', ids: ['route-1'] }),
    );

    expect(result.type).toBe('deleteStoreRoutes/rejected');
    expect(mockedBffService.deleteStoreRoutes).not.toHaveBeenCalled();
  });
});
