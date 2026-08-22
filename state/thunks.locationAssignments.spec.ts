import { configureStore } from '@reduxjs/toolkit';

import generalReducer, { generalSlice } from './slices/generalSlice';
import listsReducer, { listsSlice } from './slices/listsSlice';
import {
  assignLocationToItems,
  assignLocationsToItems,
  updateItemsForRouteLocationChange,
} from './thunks';

import { BFF_SERVICE } from '@/components/services/BffService';
import { StoreSpecificValueKey, StoreSpecificValuesMap } from '@/types/Item';
import { UserAccount } from '@/types/bffService';

jest.mock('./slices/listsSlice', () =>
  jest.requireActual('./slices/listsSlice'),
);

jest.mock('@/components/services/BffService', () => ({
  BFF_SERVICE: {
    saveStoreSpecificValues: jest.fn(),
  },
}));

jest.mock('@/constants/general', () => ({
  ...jest.requireActual('@/constants/general'),
  EMPTY_STRING: '',
}));

const mockedSaveStoreSpecificValues =
  BFF_SERVICE.saveStoreSpecificValues as jest.Mock;
const defaultGeneralState = generalReducer(undefined, { type: '@@INIT' });
const defaultListsState = listsReducer(undefined, { type: '@@INIT' });

const DEFAULT_ACCOUNT: UserAccount = {
  _id: 'user-1',
  email: 'user@example.com',
  password: 'password123',
};

const ROUTE_ID = 'route-1';
const OTHER_ROUTE_ID = 'route-2';

function makeTestStore(
  storeSpecificValuesMap: StoreSpecificValuesMap = {},
  account: Partial<UserAccount> | null = DEFAULT_ACCOUNT,
) {
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
        storeSpecificValuesMap,
      },
    } as any,
  });
}

function getStoreSpecificValuesMap(store: ReturnType<typeof makeTestStore>) {
  return store.getState()[listsSlice.name].storeSpecificValuesMap;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('assignLocationToItems', () => {
  it('assigns and unassigns multiple items in one route-scoped save', async () => {
    const initialMap = {
      'item-1': {
        [StoreSpecificValueKey.Location]: {
          [OTHER_ROUTE_ID]: 'Other Location',
        },
        [StoreSpecificValueKey.Note]: { 'store-1': 'Keep this value' },
      },
      'item-2': {
        [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Old Location' },
      },
    } as StoreSpecificValuesMap;
    const store = makeTestStore(initialMap);
    mockedSaveStoreSpecificValues.mockResolvedValue({ acknowledged: true });

    const result = await store.dispatch(
      assignLocationToItems({
        storeId: 'store-1',
        routeId: ROUTE_ID,
        location: 'Produce',
        itemKeysToAssign: ['item-1'],
        itemKeysToUnassign: ['item-2'],
      }),
    );

    expect(result.type).toBe('assignLocationToItems/fulfilled');
    expect(mockedSaveStoreSpecificValues).toHaveBeenCalledTimes(1);
    expect(mockedSaveStoreSpecificValues).toHaveBeenCalledWith(
      expect.objectContaining({
        storeSpecificValuesMap: {
          'item-1': {
            [StoreSpecificValueKey.Location]: {
              [OTHER_ROUTE_ID]: 'Other Location',
              [ROUTE_ID]: 'Produce',
            },
            [StoreSpecificValueKey.Note]: { 'store-1': 'Keep this value' },
          },
          'item-2': {
            [StoreSpecificValueKey.Location]: { [ROUTE_ID]: '' },
          },
        },
      }),
    );
    expect(getStoreSpecificValuesMap(store)).toEqual(
      expect.objectContaining({
        'item-1': expect.objectContaining({
          [StoreSpecificValueKey.Location]: expect.objectContaining({
            [ROUTE_ID]: 'Produce',
          }),
        }),
        'item-2': expect.objectContaining({
          [StoreSpecificValueKey.Location]: { [ROUTE_ID]: '' },
        }),
      }),
    );
  });

  it('rejects an empty change set without saving', async () => {
    const store = makeTestStore();

    const result = await store.dispatch(
      assignLocationToItems({
        storeId: 'store-1',
        routeId: ROUTE_ID,
        location: 'Produce',
        itemKeysToAssign: [],
        itemKeysToUnassign: [],
      }),
    );

    expect(result.type).toBe('assignLocationToItems/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('rejects without credentials', async () => {
    const store = makeTestStore({}, { _id: '', password: '' });

    const result = await store.dispatch(
      assignLocationToItems({
        storeId: 'store-1',
        routeId: ROUTE_ID,
        location: 'Produce',
        itemKeysToAssign: ['item-1'],
        itemKeysToUnassign: [],
      }),
    );

    expect(result.type).toBe('assignLocationToItems/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('updates local state in the finally block when saving fails', async () => {
    const store = makeTestStore();
    mockedSaveStoreSpecificValues.mockResolvedValue(undefined);

    const result = await store.dispatch(
      assignLocationToItems({
        storeId: 'store-1',
        routeId: ROUTE_ID,
        location: 'Produce',
        itemKeysToAssign: ['item-1'],
        itemKeysToUnassign: [],
      }),
    );

    expect(result.type).toBe('assignLocationToItems/rejected');
    expect(getStoreSpecificValuesMap(store)['item-1']).toEqual({
      [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Produce' },
    });
  });
});

describe('assignLocationsToItems', () => {
  it('assigns different locations while preserving existing values', async () => {
    const initialMap = {
      'item-1': {
        [StoreSpecificValueKey.Location]: {
          [OTHER_ROUTE_ID]: 'Other Location',
        },
      },
    } as StoreSpecificValuesMap;
    const store = makeTestStore(initialMap);
    mockedSaveStoreSpecificValues.mockResolvedValue({ acknowledged: true });

    const result = await store.dispatch(
      assignLocationsToItems({
        routeId: ROUTE_ID,
        assignments: {
          'item-1': 'Produce',
          'item-2': '',
        },
      }),
    );

    expect(result.type).toBe('assignLocationsToItems/fulfilled');
    expect(mockedSaveStoreSpecificValues).toHaveBeenCalledTimes(1);
    expect(mockedSaveStoreSpecificValues).toHaveBeenCalledWith(
      expect.objectContaining({
        storeSpecificValuesMap: {
          'item-1': {
            [StoreSpecificValueKey.Location]: {
              [OTHER_ROUTE_ID]: 'Other Location',
              [ROUTE_ID]: 'Produce',
            },
          },
          'item-2': {
            [StoreSpecificValueKey.Location]: { [ROUTE_ID]: '' },
          },
        },
      }),
    );
  });

  it('rejects an empty assignment map', async () => {
    const store = makeTestStore();

    const result = await store.dispatch(
      assignLocationsToItems({ routeId: ROUTE_ID, assignments: {} }),
    );

    expect(result.type).toBe('assignLocationsToItems/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('rejects when routeId is missing', async () => {
    const store = makeTestStore();

    const result = await store.dispatch(
      assignLocationsToItems({
        routeId: '',
        assignments: { 'item-1': 'Produce' },
      }),
    );

    expect(result.type).toBe('assignLocationsToItems/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('rejects without credentials', async () => {
    const store = makeTestStore({}, { _id: '', password: '' });

    const result = await store.dispatch(
      assignLocationsToItems({
        routeId: ROUTE_ID,
        assignments: { 'item-1': 'Produce' },
      }),
    );

    expect(result.type).toBe('assignLocationsToItems/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('updates local state when saving fails', async () => {
    const store = makeTestStore();
    mockedSaveStoreSpecificValues.mockResolvedValue(undefined);

    const result = await store.dispatch(
      assignLocationsToItems({
        routeId: ROUTE_ID,
        assignments: { 'item-1': 'Produce' },
      }),
    );

    expect(result.type).toBe('assignLocationsToItems/rejected');
    expect(getStoreSpecificValuesMap(store)['item-1']).toEqual({
      [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Produce' },
    });
  });
});

describe('updateItemsForRouteLocationChange', () => {
  it('renames matching route locations in one save', async () => {
    const initialMap = {
      'item-1': {
        [StoreSpecificValueKey.Location]: {
          [ROUTE_ID]: 'Produce',
          [OTHER_ROUTE_ID]: 'Other Location',
        },
      },
      'item-2': {
        [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Produce' },
      },
      'item-3': {
        [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Dairy' },
      },
    } as StoreSpecificValuesMap;
    const store = makeTestStore(initialMap);
    mockedSaveStoreSpecificValues.mockResolvedValue({ acknowledged: true });

    const result = await store.dispatch(
      updateItemsForRouteLocationChange({
        routeId: ROUTE_ID,
        oldLocationName: 'Produce',
        newLocationName: 'Fresh Produce',
      }),
    );

    expect(result.type).toBe('updateItemsForRouteLocationChange/fulfilled');
    expect(mockedSaveStoreSpecificValues).toHaveBeenCalledTimes(1);
    expect(mockedSaveStoreSpecificValues).toHaveBeenCalledWith(
      expect.objectContaining({
        storeSpecificValuesMap: {
          'item-1': {
            [StoreSpecificValueKey.Location]: {
              [ROUTE_ID]: 'Fresh Produce',
              [OTHER_ROUTE_ID]: 'Other Location',
            },
          },
          'item-2': {
            [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Fresh Produce' },
          },
        },
      }),
    );
    expect(getStoreSpecificValuesMap(store)['item-3']).toEqual(
      initialMap['item-3'],
    );
  });

  it('clears matching locations when a route location is deleted', async () => {
    const store = makeTestStore({
      'item-1': {
        [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Produce' },
      },
    });
    mockedSaveStoreSpecificValues.mockResolvedValue({ acknowledged: true });

    const result = await store.dispatch(
      updateItemsForRouteLocationChange({
        routeId: ROUTE_ID,
        oldLocationName: 'Produce',
      }),
    );

    expect(result.type).toBe('updateItemsForRouteLocationChange/fulfilled');
    expect(getStoreSpecificValuesMap(store)['item-1']).toEqual({
      [StoreSpecificValueKey.Location]: { [ROUTE_ID]: '' },
    });
  });

  it('rejects invalid input without saving', async () => {
    const store = makeTestStore();

    const result = await store.dispatch(
      updateItemsForRouteLocationChange({
        routeId: '',
        oldLocationName: '',
      }),
    );

    expect(result.type).toBe('updateItemsForRouteLocationChange/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('rejects without credentials', async () => {
    const store = makeTestStore(
      {
        'item-1': {
          [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Produce' },
        },
      },
      { _id: '', password: '' },
    );

    const result = await store.dispatch(
      updateItemsForRouteLocationChange({
        routeId: ROUTE_ID,
        oldLocationName: 'Produce',
      }),
    );

    expect(result.type).toBe('updateItemsForRouteLocationChange/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('rejects when no items match the old location', async () => {
    const store = makeTestStore({
      'item-1': {
        [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Dairy' },
      },
    });

    const result = await store.dispatch(
      updateItemsForRouteLocationChange({
        routeId: ROUTE_ID,
        oldLocationName: 'Produce',
      }),
    );

    expect(result.type).toBe('updateItemsForRouteLocationChange/rejected');
    expect(mockedSaveStoreSpecificValues).not.toHaveBeenCalled();
  });

  it('updates local state when saving the route location change fails', async () => {
    const store = makeTestStore({
      'item-1': {
        [StoreSpecificValueKey.Location]: { [ROUTE_ID]: 'Produce' },
      },
    });
    mockedSaveStoreSpecificValues.mockResolvedValue(undefined);

    const result = await store.dispatch(
      updateItemsForRouteLocationChange({
        routeId: ROUTE_ID,
        oldLocationName: 'Produce',
        newLocationName: 'Fresh Produce',
      }),
    );

    expect(result.type).toBe('updateItemsForRouteLocationChange/rejected');
    expect(getStoreSpecificValuesMap(store)['item-1']).toEqual({
      [StoreSpecificValueKey.Location]: {
        [ROUTE_ID]: 'Fresh Produce',
      },
    });
  });
});
