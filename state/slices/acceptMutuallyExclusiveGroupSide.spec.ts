// Override the global mock from jest-setup.ts so the real reducer runs.
// jest.mock calls are hoisted — by the time the factory runs, all dependency
// mocks below are already registered, so jest.requireActual resolves
// listsSlice's imports against those mocks rather than native modules.
import {
  acceptMutuallyExclusiveGroupSide,
  listsSlice,
  type ListsState,
} from './listsSlice';

import { StoreSpecificValueKey } from '@/types/Item';
import { MutuallyExclusiveGroup } from '@/types/listSlice';

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORE_ID = 'test-store';

function qty(state: ListsState, key: string): number | undefined {
  return (state.storeSpecificValuesMap[key] as any)?.[
    StoreSpecificValueKey.Quantity
  ]?.[STORE_ID];
}

function isInCart(state: ListsState, key: string): boolean | undefined {
  return (state.storeSpecificValuesMap[key] as any)?.[
    StoreSpecificValueKey.IsInCart
  ]?.[STORE_ID];
}

/** Build a storeSpecificValuesMap entry. */
function ssvEntry(quantity: number, inCart = false) {
  return {
    [StoreSpecificValueKey.Quantity]: { [STORE_ID]: quantity },
    [StoreSpecificValueKey.IsInCart]: { [STORE_ID]: inCart },
  };
}

/** Build a MutuallyExclusiveGroup. */
function makeGroup(
  id: string,
  itemKeys1: string[],
  itemKeys2: string[],
  quantities1?: number[],
  quantities2?: number[],
): MutuallyExclusiveGroup {
  return {
    id,
    name: 'Test Group',
    itemKeys1,
    itemKeys2,
    quantities1: quantities1 ?? itemKeys1.map(() => 1),
    quantities2: quantities2 ?? itemKeys2.map(() => 1),
  };
}

/** Build the minimal slice state needed for these tests. */
function makeState(
  groups: MutuallyExclusiveGroup[],
  ssvMap: Record<string, ReturnType<typeof ssvEntry>> = {},
): ListsState {
  return {
    currentStoreId: STORE_ID,
    mutuallyExclusiveGroups: groups,
    storeSpecificValuesMap: ssvMap,
  } as unknown as ListsState;
}

const reduce = listsSlice.reducer;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('acceptMutuallyExclusiveGroupSide', () => {
  /**
   * MEG used across most tests:
   *   Side 1 (A): item-a (qty 2), item-b (qty 3)
   *   Side 2 (B): item-c (qty 4), item-d (qty 5)
   */
  const GROUP = makeGroup(
    'g1',
    ['item-a', 'item-b'],
    ['item-c', 'item-d'],
    [2, 3],
    [4, 5],
  );

  // -------------------------------------------------------------------------
  // InCart items are ignored
  // -------------------------------------------------------------------------

  describe('InCart items are ignored', () => {
    it('does not add to an accepted-side item that is in the cart', () => {
      const state = makeState([GROUP], {
        'item-a': ssvEntry(10, true), // in cart
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(qty(result, 'item-a')).toBe(10); // unchanged
      expect(isInCart(result, 'item-a')).toBe(true); // still in cart
    });

    it('does not set isInCart to false for accepted-side cart items', () => {
      const state = makeState([GROUP], {
        'item-b': ssvEntry(2, true),
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(isInCart(result, 'item-b')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Case: no MEG items in the shopping list
  // -------------------------------------------------------------------------

  describe('Case: no MEG items in shopping list', () => {
    it('adds accepted-side items with their MEG quantities', () => {
      const state = makeState([GROUP]); // empty ssv map

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(qty(result, 'item-a')).toBe(2);
      expect(qty(result, 'item-b')).toBe(3);
    });

    it('does not add rejected-side items', () => {
      const state = makeState([GROUP]);

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(qty(result, 'item-c')).toBeUndefined();
      expect(qty(result, 'item-d')).toBeUndefined();
    });

    it('leaves unrelated shopping-list items unaffected', () => {
      const state = makeState([GROUP], {
        unrelated: ssvEntry(7),
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(qty(result, 'unrelated')).toBe(7);
    });

    it('works symmetrically when accepting side 2', () => {
      const state = makeState([GROUP]);

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 2 }),
      );

      expect(qty(result, 'item-c')).toBe(4);
      expect(qty(result, 'item-d')).toBe(5);
      expect(qty(result, 'item-a')).toBeUndefined();
      expect(qty(result, 'item-b')).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Case: some MEG items already in the shopping list
  // -------------------------------------------------------------------------

  describe('Case: some MEG items already in shopping list', () => {
    it('increments quantity for accepted-side items that are already in the list', () => {
      const state = makeState([GROUP], {
        'item-a': ssvEntry(5), // already in shopping list
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      // item-a was qty=5, MEG adds 2 → 7
      expect(qty(result, 'item-a')).toBe(7);
    });

    it('sets MEG quantity for accepted-side items that are not in the list', () => {
      const state = makeState([GROUP], {
        'item-a': ssvEntry(5), // in list, item-b is not
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      // item-b was not in list, gets MEG qty 3
      expect(qty(result, 'item-b')).toBe(3);
    });

    it('does not modify items in the list that are not in the MEG', () => {
      const state = makeState([GROUP], {
        'item-a': ssvEntry(5),
        'not-in-group': ssvEntry(9),
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(qty(result, 'not-in-group')).toBe(9);
    });

    it('does not modify rejected-side items that are in the shopping list', () => {
      const state = makeState([GROUP], {
        'item-a': ssvEntry(5),
        'item-c': ssvEntry(8), // on rejected side but independently in the list
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      // item-c should be left at 8, not zeroed
      expect(qty(result, 'item-c')).toBe(8);
    });

    it('sets accepted-side items to isInCart=false when not in cart', () => {
      const state = makeState([GROUP], {
        'item-a': ssvEntry(5),
      });

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(isInCart(result, 'item-a')).toBe(false);
      expect(isInCart(result, 'item-b')).toBe(false); // newly created entry
    });
  });

  // -------------------------------------------------------------------------
  // Group lifecycle
  // -------------------------------------------------------------------------

  describe('Group lifecycle', () => {
    it('removes the accepted group from the state', () => {
      const state = makeState([GROUP]);

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(result.mutuallyExclusiveGroups).toHaveLength(0);
    });

    it('leaves other groups intact', () => {
      const group2 = makeGroup('g2', ['x'], ['y']);
      const state = makeState([GROUP, group2]);

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({ id: 'g1', acceptedSide: 1 }),
      );

      expect(result.mutuallyExclusiveGroups).toHaveLength(1);
      expect(result.mutuallyExclusiveGroups[0].id).toBe('g2');
    });

    it('is a no-op when the group id does not exist', () => {
      const state = makeState([GROUP]);

      const result = reduce(
        state,
        acceptMutuallyExclusiveGroupSide({
          id: 'nonexistent',
          acceptedSide: 1,
        }),
      );

      expect(result.mutuallyExclusiveGroups).toHaveLength(1);
    });
  });
});
