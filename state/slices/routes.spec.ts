// jest-setup.ts globally stubs listsSlice with just `{ ListName }` so other
// tests that don't need the real reducer avoid pulling in native-touching
// dependencies. Override that here since these tests need the real reducer.
import {
  addRoute,
  updateRoute,
  deleteRoute,
  setActiveRouteId,
  listsSlice,
  routesForStoreSelector,
  activeRouteIdSelector,
  activeRouteSelector,
  locationsForStoreSelector,
  storeSpecificValueForIdSelector,
  type ListsState,
} from './listsSlice';
import { RootState } from '../store';

import { StoreSpecificValueKey } from '@/types/Item';
import { Route } from '@/types/Store';

jest.mock('./listsSlice', () => jest.requireActual('./listsSlice'));

// Stub out helpers that pull in native (Expo / React Native) modules.
jest.mock('@/utils/helpers', () => ({
  calculateDistance: jest.fn(),
  deleteImages: jest.fn(),
  displayAlert: jest.fn(),
  getEmptyArray: () => [],
  getEmptyList: () => ({ data: [], sortOrderValue: {}, filters: {} }),
  getEmptyObject: () => ({}),
  getFilteredList: (list: any) => list,
  getId: jest.fn(() => 'mock-route-id'),
  getIsPreviouslyPurchasedItemRecommended: jest.fn(() => false),
  getItemFromList: jest.fn(),
  getKeyToUse: (key: any) =>
    typeof key === 'string' ? key : key?._id ?? key?.upc ?? key?.name ?? '',
  getStoreWithDistance: jest.fn((store: any) => store),
  getCurrentStore: jest.fn(),
  getSortOrderValues: jest.fn(),
}));

jest.mock('@/utils/iterateStoreSpecificValuesMap', () => ({
  iterateStoreSpecificValuesMap: jest.fn(),
  ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE: Symbol('skip'),
}));

jest.mock('@/utils/getMostRecentExpirationDates', () => ({
  getMostRecentExpirationDates: jest.fn(),
}));

jest.mock('@/utils/getUpdatedExpirationDates', () => ({
  getUpdatedExpirationDates: jest.fn(),
}));

jest.mock('@/utils/getExpirationDatesQuantity', () => ({
  getExpirationDatesQuantity: jest.fn(),
}));

jest.mock('@/utils/getItemWithStoreSpecificValues', () => ({
  getItemWithStoreSpecificValues: jest.fn(),
}));

jest.mock('@/components/lists/sorters', () => ({
  getSorter: jest.fn(),
  SortOrder: { Asc: 'Asc', Desc: 'Desc' },
  SortType: {},
}));

// Store is only used for TypeScript types in the slice — empty stub is fine.
jest.mock('../store', () => ({}));

const reduce = listsSlice.reducer;

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

function makeState(overrides: Partial<ListsState> = {}): ListsState {
  return {
    storesList: { data: [], sortOrderValue: {}, filters: {} },
    activeRouteIds: {},
    ...overrides,
  } as unknown as ListsState;
}

describe('route reducers', () => {
  describe('addRoute', () => {
    it('adds a new route to the matching store, generating an id if none is provided', () => {
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1', routes: [] }],
        } as any,
      });

      const result = reduce(
        state,
        addRoute({
          name: 'New Route',
          storeId: 'store-1',
          locations: ['Produce'],
          userId: 'user-1',
          userIdsWithAccess: [],
        }),
      );

      expect(result.storesList.data[0].routes).toHaveLength(1);
      expect(result.storesList.data[0].routes[0]).toMatchObject({
        id: 'mock-route-id',
        name: 'New Route',
        storeId: 'store-1',
      });
    });

    it('uses the provided id instead of generating one', () => {
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1', routes: [] }],
        } as any,
      });

      const result = reduce(state, addRoute(makeRoute({ id: 'explicit-id' })));

      expect(result.storesList.data[0].routes[0].id).toBe('explicit-id');
    });

    it('initializes the routes array if missing', () => {
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1' } as any],
        } as any,
      });

      const result = reduce(state, addRoute(makeRoute()));

      expect(result.storesList.data[0].routes).toHaveLength(1);
    });

    it('does nothing if the store cannot be found', () => {
      const state = makeState({
        storesList: { data: [] as any },
      });

      const result = reduce(
        state,
        addRoute(makeRoute({ storeId: 'nonexistent' })),
      );

      expect(result.storesList.data).toHaveLength(0);
    });
  });

  describe('updateRoute', () => {
    it('updates an existing route in place', () => {
      const existing = makeRoute();
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1', routes: [existing] }],
        } as any,
      });

      const updated = { ...existing, name: 'Renamed Route' };
      const result = reduce(state, updateRoute(updated));

      expect(result.storesList.data[0].routes[0].name).toBe('Renamed Route');
    });

    it('does nothing if the route id does not exist', () => {
      const existing = makeRoute();
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1', routes: [existing] }],
        } as any,
      });

      const result = reduce(
        state,
        updateRoute(makeRoute({ id: 'other-id', name: 'Should not apply' })),
      );

      expect(result.storesList.data[0].routes[0].name).toBe(existing.name);
      expect(result.storesList.data[0].routes).toHaveLength(1);
    });

    it('does nothing if the store has no routes', () => {
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1' } as any],
        } as any,
      });

      const result = reduce(state, updateRoute(makeRoute()));

      expect(result.storesList.data[0].routes).toBeUndefined();
    });

    it('does nothing if the store cannot be found', () => {
      const state = makeState({
        storesList: { data: [] as any },
      });

      const result = reduce(
        state,
        deleteRoute({ id: 'route-1', storeId: 'nonexistent-store' }),
      );

      expect(result.storesList.data).toHaveLength(0);
      expect(result.activeRouteIds).toEqual({});
    });
  });

  describe('deleteRoute', () => {
    it('removes the route from the store', () => {
      const routeToDelete = makeRoute({ id: 'route-1' });
      const otherRoute = makeRoute({ id: 'route-2', name: 'Other' });
      const state = makeState({
        storesList: {
          data: [
            {
              _id: 'store-1',
              name: 'Store 1',
              routes: [routeToDelete, otherRoute],
            },
          ],
        } as any,
      });

      const result = reduce(
        state,
        deleteRoute({ id: 'route-1', storeId: 'store-1' }),
      );

      expect(result.storesList.data[0].routes).toHaveLength(1);
      expect(result.storesList.data[0].routes[0].id).toBe('route-2');
    });

    it("clears only the deleted store's active route", () => {
      const routeToDelete = makeRoute({ id: 'route-1' });
      const state = makeState({
        activeRouteIds: { 'store-1': 'route-1', 'store-2': 'route-2' },
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1', routes: [routeToDelete] }],
        } as any,
      });

      const result = reduce(
        state,
        deleteRoute({ id: 'route-1', storeId: 'store-1' }),
      );

      expect(result.activeRouteIds).toEqual({
        'store-1': null,
        'store-2': 'route-2',
      });
    });

    it('does not clear the active route if a different route was deleted', () => {
      const state = makeState({
        activeRouteIds: { 'store-1': 'route-2' },
        storesList: {
          data: [
            {
              _id: 'store-1',
              name: 'Store 1',
              routes: [
                makeRoute({ id: 'route-1' }),
                makeRoute({ id: 'route-2' }),
              ],
            },
          ],
        } as any,
      });

      const result = reduce(
        state,
        deleteRoute({ id: 'route-1', storeId: 'store-1' }),
      );

      expect(result.activeRouteIds['store-1']).toBe('route-2');
    });

    it('does nothing if the store has no routes', () => {
      const state = makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Store 1' } as any],
        } as any,
      });

      const result = reduce(
        state,
        deleteRoute({ id: 'route-1', storeId: 'store-1' }),
      );

      expect(result.storesList.data[0].routes).toBeUndefined();
    });
  });

  describe('setActiveRouteId', () => {
    it('sets the active route id for the given store', () => {
      const state = makeState();
      const result = reduce(
        state,
        setActiveRouteId({ storeId: 'store-1', routeId: 'route-1' }),
      );
      expect(result.activeRouteIds).toEqual({ 'store-1': 'route-1' });
    });

    it("keeps another store's active route when one store is cleared", () => {
      const state = makeState({
        activeRouteIds: { 'store-1': 'route-1', 'store-2': 'route-2' },
      });
      const result = reduce(
        state,
        setActiveRouteId({ storeId: 'store-1', routeId: null }),
      );
      expect(result.activeRouteIds).toEqual({
        'store-1': null,
        'store-2': 'route-2',
      });
    });
  });
});

describe('route selectors', () => {
  function makeRootState(
    storesData: any[],
    activeRouteIds: Record<string, string | null> = {},
  ) {
    return {
      lists: {
        storesList: { data: storesData },
        activeRouteIds,
      },
    } as unknown as RootState;
  }

  describe('routesForStoreSelector', () => {
    it('returns the routes for the matching store', () => {
      const route = makeRoute();
      const state = makeRootState([
        { _id: 'store-1', name: 'Store 1', routes: [route] },
      ]);

      expect(routesForStoreSelector('store-1')(state)).toEqual([route]);
    });

    it('returns an empty array if the store is not found', () => {
      const state = makeRootState([]);
      expect(routesForStoreSelector('nonexistent')(state)).toEqual([]);
    });

    it('returns an empty array if the store has no routes', () => {
      const state = makeRootState([{ _id: 'store-1', name: 'Store 1' }]);
      expect(routesForStoreSelector('store-1')(state)).toEqual([]);
    });
  });

  describe('activeRouteIdSelector', () => {
    it('returns the active route id', () => {
      const state = makeRootState([], { 'store-1': 'route-1' });
      expect(activeRouteIdSelector('store-1')(state)).toBe('route-1');
    });

    it("returns each store's active route independently", () => {
      const state = makeRootState([], {
        'store-1': 'route-1',
        'store-2': 'route-2',
      });

      expect(activeRouteIdSelector('store-1')(state)).toBe('route-1');
      expect(activeRouteIdSelector('store-2')(state)).toBe('route-2');
    });
  });

  describe('activeRouteSelector', () => {
    it('returns the active route object for the store', () => {
      const route = makeRoute({ id: 'route-1' });
      const state = makeRootState(
        [{ _id: 'store-1', name: 'Store 1', routes: [route] }],
        { 'store-1': 'route-1' },
      );
      expect(activeRouteSelector('store-1')(state)).toEqual(route);
    });

    it('returns null if there is no active route id', () => {
      const route = makeRoute({ id: 'route-1' });
      const state = makeRootState(
        [{ _id: 'store-1', name: 'Store 1', routes: [route] }],
        {},
      );
      expect(activeRouteSelector('store-1')(state)).toBeNull();
    });

    it('returns null if the active route id does not match any route for the store', () => {
      const route = makeRoute({ id: 'route-1' });
      const state = makeRootState(
        [{ _id: 'store-1', name: 'Store 1', routes: [route] }],
        { 'store-1': 'route-2' },
      );
      expect(activeRouteSelector('store-1')(state)).toBeNull();
    });
  });

  describe('locationsForStoreSelector', () => {
    it('returns the unique set of locations across all routes for the store', () => {
      const state = makeRootState([
        {
          _id: 'store-1',
          name: 'Store 1',
          routes: [
            makeRoute({ id: 'route-1', locations: ['Produce', 'Dairy'] }),
            makeRoute({ id: 'route-2', locations: ['Dairy', 'Bakery'] }),
          ],
        },
      ]);

      expect(locationsForStoreSelector('store-1')(state)).toEqual([
        'Produce',
        'Dairy',
        'Bakery',
      ]);
    });

    it('returns an empty array if the store has no routes', () => {
      const state = makeRootState([{ _id: 'store-1', name: 'Store 1' }]);
      expect(locationsForStoreSelector('store-1')(state)).toEqual([]);
    });
  });

  describe('storeSpecificValueForIdSelector', () => {
    it('reads a route-specific value by route id', () => {
      const state = {
        lists: {
          storeSpecificValuesMap: {
            'item-1': {
              [StoreSpecificValueKey.Location]: {
                'route-1': 'Produce',
                'route-2': 'Dairy',
              },
            },
          },
        },
      } as unknown as RootState;

      expect(
        storeSpecificValueForIdSelector(
          'item-1',
          StoreSpecificValueKey.Location,
          'route-2',
        )(state),
      ).toBe('Dairy');
    });

    it('does not fall back to a different id when the requested value is missing', () => {
      const state = {
        lists: {
          storeSpecificValuesMap: {
            'item-1': {
              [StoreSpecificValueKey.Location]: {
                'route-1': 'Produce',
              },
            },
          },
        },
      } as unknown as RootState;

      expect(
        storeSpecificValueForIdSelector(
          'item-1',
          StoreSpecificValueKey.Location,
          'route-2',
        )(state),
      ).toBeUndefined();
    });

    it('returns undefined when the id is empty or the item is missing', () => {
      const state = {
        lists: { storeSpecificValuesMap: {} },
      } as unknown as RootState;

      expect(
        storeSpecificValueForIdSelector(
          'item-1',
          StoreSpecificValueKey.Location,
          '',
        )(state),
      ).toBeUndefined();
      expect(
        storeSpecificValueForIdSelector(
          'item-1',
          StoreSpecificValueKey.Location,
          'route-1',
        )(state),
      ).toBeUndefined();
    });
  });
});
