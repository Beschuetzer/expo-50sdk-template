import {
  acceptMutuallyExclusiveGroupSide,
  activeRouteIdSelector,
  activeRouteSelector,
  addAllToShoppingCart,
  addInventoryLocation,
  addInventoryLocations,
  addItemsListItem,
  addItemsToItemsList,
  addItemToCart,
  addMutuallyExclusiveGroup,
  addReturnItem,
  addRoute,
  addStoresListItem,
  addStoreSpecificValues,
  clearShopping,
  copyStoreSpecificValues,
  currentInventoryLocationIdSelector,
  currentInventoryLocationItemsSelector,
  currentInventoryLocationSelector,
  currentLocationSelector,
  currentLocationStateSelector,
  currentStoreIdSelector,
  currentStoreSelector,
  deleteRoute,
  handleLoadAllResponse,
  handleSaveAllResponse,
  insertInventoryItem,
  insertInventoryItems,
  inventoryItemSelector,
  inventoryItemsSelector,
  inventoryLocationsSelector,
  inventorySelector,
  locationsForStoreSelector,
  itemInListsCountSelector,
  itemsPurchasedAtStoreSelector,
  itemsListItemSelector,
  itemsListWithStoreSpecificValuesSelector,
  moveInventoryItem,
  moveInventoryItemExpirationDates,
  moveInventoryItems,
  moveAllToInCart,
  moveItemToAnotherCart,
  moveItemToShoppingList,
  moveSelectedPreviouslyPurchasedItemsToShopping,
  moveSelectedToCart,
  moveSelectedToShopping,
  priceOfItemsSelector,
  previouslyPurchasedListSelector,
  processItemToLocationMap,
  removeInventoryItem,
  removeInventoryItems,
  removeInventoryLocation,
  removeInventoryLocations,
  removeItemFromMutuallyExclusiveGroup,
  removeItemsListItems,
  removeMostRecentInventoryItem,
  removeMutuallyExclusiveGroup,
  removeReturnItem,
  removeShoppingListItems,
  removeStoresListItems,
  resetCurrentLocation,
  resetCurrentLocationState,
  resetInventoryItems,
  resetInventoryLocations,
  resetItemsList,
  resetLastPurchasedMap,
  resetListToDisplay,
  resetListToDisplayFilters,
  resetSelectedItemsInShopping,
  resetStoresList,
  returnItemsSelector,
  routesForStoreSelector,
  setCurrentInventoryLocationId,
  setCurrentLocation,
  setCurrentLocationState,
  setCurrentStoreId,
  setFilters,
  setInventory,
  setItemsList,
  setLastDecrementedItemId,
  setLastPurchasedMap,
  setMutuallyExclusiveGroups,
  setReturnItems,
  setSortOrder,
  setStoresList,
  setStoreSpecificValues,
  setIsMultiSelectModeForInCartCart,
  setIsMultiSelectModeForPreviouslyPurchased,
  setIsMultiSelectModeForShoppingCart,
  shoppingListSelector,
  setActiveRouteId,
  storeItemsCountSelector,
  storeSpecificListSelector,
  storeSpecificValuesSelector,
  storeSpecificValueForIdSelector,
  listToDisplaySelector,
  toggleSortOrder,
  completePurchase,
  updateMutuallyExclusiveGroup,
  updateRoute,
  updateSelectedItemsFromInCart,
  updateSelectedItemsFromPreviouslyPurchased,
  updateSelectedItemsFromShoppingCart,
  updateStoreSpecificValues,
  listsSlice,
  type ListsState,
} from './listsSlice';

import { StoreSpecificValueKey } from '@/types/Item';
import { ListName } from '@/types/listSlice';

jest.mock('./listsSlice', () => jest.requireActual('./listsSlice'));
jest.mock('@/constants/general', () => ({
  EMPTY_NUMBER: 0,
  EMPTY_STRING: '',
  STORE_SPECIFIC_VALUE_KEY_DEFAULTS: {
    aisleNumber: 0,
    isInCart: false,
    itemId: '',
    location: '',
    note: '',
    price: 0,
    quantity: 0,
  },
}));

jest.mock('@/utils/helpers', () => ({
  calculateDistance: jest.fn(() => 12),
  deleteImages: jest.fn(),
  displayAlert: jest.fn(),
  getEmptyArray: () => [],
  getEmptyList: () => ({ data: [], sortOrderValue: {}, filters: {} }),
  getEmptyObject: () => ({}),
  getFilteredList: (list: any) => list.filter((item: any) => item),
  getId: jest.fn(() => 'generated-route-id'),
  getIsPreviouslyPurchasedItemRecommended: jest.fn(() => false),
  getItemFromList: (list: any[], key: string) =>
    list.find(
      (value: any) =>
        value?._id === key || value?.upc === key || value?.name === key,
    ),
  getKeyToUse: (key: any) =>
    typeof key === 'string' ? key : key?._id ?? key?.upc ?? key?.name ?? '',
  getStoreWithDistance: jest.fn((store: any) => store),
  getCurrentStore: jest.fn(),
  getSortOrderValues: jest.fn(),
}));

jest.mock('@/utils/iterateStoreSpecificValuesMap', () => ({
  iterateStoreSpecificValuesMap: jest.fn((input: any) => {
    Object.entries(input.storeSpecificValuesMap || {}).forEach(
      ([itemKey, storeSpecificValues]) => {
        const itemInput = { itemKey, storeSpecificValues };
        const itemResult = input.onNewItemStart?.(itemInput);
        if (
          itemResult?.description === 'skip' ||
          typeof itemResult === 'symbol'
        )
          return;
        Object.entries((storeSpecificValues as any) || {}).forEach(
          ([storeSpecificValueKey, storeValues]) => {
            const valueResult = input.onNewStoreSpecificValueStart?.({
              itemKey,
              storeSpecificValueKey,
              storeSpecificValues,
            });
            if (typeof valueResult === 'symbol') return;
            Object.entries((storeValues as any) || {}).forEach(
              ([storeKey, storeValue]) =>
                input.onNewStoreValue?.({
                  itemKey,
                  storeKey,
                  storeValue,
                  storeSpecificValueKey,
                  storeSpecificValues,
                }),
            );
          },
        );
      },
    );
  }),
  ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE: Symbol('skip'),
}));

jest.mock('@/utils/getMostRecentExpirationDates', () => ({
  getMostRecentExpirationDates: jest.fn((dates: any, count: number) =>
    Object.fromEntries(
      Object.entries(dates || {})
        .sort(([left], [right]) => Number(right) - Number(left))
        .slice(0, count),
    ),
  ),
}));
jest.mock('@/utils/getUpdatedExpirationDates', () => ({
  getUpdatedExpirationDates: jest.fn(
    (current: any, updates: any, operation: string) => {
      const result = { ...(current || {}) };
      Object.entries(updates || {}).forEach(([date, quantity]) => {
        result[date] =
          (result[date] || 0) +
          (operation === 'add' ? (quantity as number) : -(quantity as number));
        if (result[date] <= 0) delete result[date];
      });
      return result;
    },
  ),
}));
jest.mock('@/utils/getExpirationDatesQuantity', () => ({
  getExpirationDatesQuantity: jest.fn((dates: any) =>
    Object.values(dates || {}).reduce(
      (sum: number, value: any) => sum + value,
      0,
    ),
  ),
}));
jest.mock('@/utils/getItemWithStoreSpecificValues', () => ({
  getItemWithStoreSpecificValues: jest.fn((item: any, values: any) => ({
    ...item,
    ...values,
  })),
}));
jest.mock('@/components/lists/sorters', () => ({
  getSorter: jest.fn(() => () => 0),
  SortOrder: {
    Ascending: 'Ascending',
    Descending: 'Descending',
  },
  SortType: {},
}));
jest.mock('../store', () => ({}));

type TestItem = { _id: string; name: string; upc?: string };

const reduce = listsSlice.reducer;
const item: TestItem = { _id: 'item-1', name: 'Milk', upc: '111' };
const secondItem: TestItem = {
  _id: 'item-2',
  name: 'Bread',
  upc: '222',
};

function makeState(overrides: Partial<ListsState> = {}): ListsState {
  return {
    currentLocation: null,
    currentLocationState: 'None' as any,
    currentStoreId: 'store-1',
    storesList: { data: [], sortOrderValue: {}, filters: {} },
    itemsList: { data: [], sortOrderValue: {}, filters: {} },
    shoppingList: { data: [], sortOrderValue: {}, filters: {} },
    inCartList: { data: [], sortOrderValue: {}, filters: {} },
    previouslyPurchased: { data: [], sortOrderValue: {}, filters: {} },
    storeSpecificValuesMap: {},
    selectedItemsFromShoppingCart: [],
    selectedItemsFromInCart: [],
    selectedItemsFromPreviouslyPurchased: [],
    isMultiSelectModeForShoppingCart: false,
    isMultiSelectModeForInCart: false,
    isMultiSelectModeForPreviouslyPurchased: false,
    mutuallyExclusiveGroups: [],
    returnItems: {},
    activeRouteIds: {},
    inventory: {
      currentLocationId: null,
      items: {},
      locations: [],
      lastDecrementedItemId: '',
    },
    ...overrides,
  } as unknown as ListsState;
}

function withStoreValues(
  state: ListsState,
  key: string,
  quantity: number,
  isInCart = false,
) {
  state.storeSpecificValuesMap[key] = {
    [StoreSpecificValueKey.Quantity]: { 'store-1': quantity },
    [StoreSpecificValueKey.IsInCart]: { 'store-1': isInCart },
  };
  return state;
}

describe('shopping list reducer behavior', () => {
  it('increments an item quantity when adding it to Shopping List', () => {
    const state = withStoreValues(makeState(), item._id, 2);

    const result = reduce(state, addAllToShoppingCart([item as any]));

    expect(
      result.storeSpecificValuesMap[item._id]?.[
        StoreSpecificValueKey.Quantity
      ]?.['store-1'],
    ).toBe(3);
  });

  it('starts an item at quantity one when it has no existing quantity', () => {
    const state = makeState();

    const result = reduce(state, addAllToShoppingCart([item as any]));

    expect(
      result.storeSpecificValuesMap[item._id]?.[
        StoreSpecificValueKey.Quantity
      ]?.['store-1'],
    ).toBe(1);
  });

  it('marks an item in cart and can move it back to Shopping List', () => {
    const state = withStoreValues(makeState(), item._id, 1);

    const inCart = reduce(state, addItemToCart(item as any));
    expect(
      inCart.storeSpecificValuesMap[item._id]?.[
        StoreSpecificValueKey.IsInCart
      ]?.['store-1'],
    ).toBe(true);

    const shopping = reduce(inCart, moveItemToShoppingList(item));
    expect(
      shopping.storeSpecificValuesMap[item._id]?.[
        StoreSpecificValueKey.IsInCart
      ]?.['store-1'],
    ).toBe(false);
  });

  it('moves selected Shopping items to cart and clears selection mode', () => {
    const state = withStoreValues(
      makeState({
        selectedItemsFromShoppingCart: [item, secondItem] as any,
        isMultiSelectModeForShoppingCart: true,
      }),
      item._id,
      1,
    );
    withStoreValues(state, secondItem._id, 2);

    const result = reduce(state, moveSelectedToCart());

    expect(result.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      true,
    );
    expect(
      result.storeSpecificValuesMap[secondItem._id]?.isInCart?.['store-1'],
    ).toBe(true);
    expect(result.selectedItemsFromShoppingCart).toEqual([]);
    expect(result.isMultiSelectModeForShoppingCart).toBe(false);
  });

  it('moves selected cart items to Shopping List and clears cart selection', () => {
    const state = withStoreValues(
      makeState({
        selectedItemsFromInCart: [item] as any,
        isMultiSelectModeForInCart: true,
      }),
      item._id,
      1,
      true,
    );

    const result = reduce(state, moveSelectedToShopping());

    expect(result.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      false,
    );
    expect(result.selectedItemsFromInCart).toEqual([]);
    expect(result.isMultiSelectModeForInCart).toBe(false);
  });

  it('removes Shopping items and clears their store-specific values', () => {
    const state = withStoreValues(makeState(), item._id, 2);
    state.shoppingList.data = [item] as any;

    const result = reduce(state, removeShoppingListItems([item] as any));

    expect(result.shoppingList.data).toEqual([]);
    expect(result.storeSpecificValuesMap[item._id]).toEqual({});
    expect(result.selectedItemsFromShoppingCart).toEqual([]);
    expect(result.isMultiSelectModeForShoppingCart).toBe(false);
  });

  it('updates a store-specific value using the current store by default', () => {
    const state = makeState();

    const result = reduce(
      state,
      updateStoreSpecificValues({
        key: item,
        storeSpecificValuesToUpdate: {
          [StoreSpecificValueKey.Quantity]: () => 4,
        },
      }),
    );

    expect(
      result.storeSpecificValuesMap[item._id]?.[
        StoreSpecificValueKey.Quantity
      ]?.['store-1'],
    ).toBe(4);
  });

  it('supports the add-to-shopping undo operation without going below zero', () => {
    const state = withStoreValues(makeState(), item._id, 1);

    const result = reduce(
      state,
      updateStoreSpecificValues({
        key: item,
        storeSpecificValuesToUpdate: {
          [StoreSpecificValueKey.Quantity]: (currentQuantity: number) =>
            Math.max(currentQuantity - 1, 0),
        },
      }),
    );

    expect(
      result.storeSpecificValuesMap[item._id]?.[
        StoreSpecificValueKey.Quantity
      ]?.['store-1'],
    ).toBe(0);
  });

  it('resets display filters without removing the list data', () => {
    const state = makeState({
      [ListName.ShoppingList]: {
        data: [item] as any,
        filters: { search: 'milk' } as any,
        sortOrderValue: { sortBy: 'name', sortOrder: 'Ascending' } as any,
      },
      selectedItemsFromShoppingCart: [item] as any,
      isMultiSelectModeForShoppingCart: true,
    });

    const result = reduce(
      state,
      resetListToDisplay({ listName: ListName.ShoppingList }),
    );

    expect(result.shoppingList.data).toEqual([item]);
    expect(result.shoppingList.filters).toEqual({});
    expect(result.selectedItemsFromShoppingCart).toEqual([]);
    expect(result.isMultiSelectModeForShoppingCart).toBe(false);
  });

  it('completes an in-cart purchase and records its last-purchased time', () => {
    const state = withStoreValues(
      makeState({ lastPurchasedMap: {} }),
      item._id,
      2,
      true,
    );

    const result = reduce(state, completePurchase({}));

    expect(result.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      false,
    );
    expect(result.storeSpecificValuesMap[item._id]?.quantity?.['store-1']).toBe(
      0,
    );
    expect(result.lastPurchasedMap[item._id]?.['store-1']).toEqual(
      expect.any(Number),
    );
  });
});

describe('route and route-keyed location behavior', () => {
  const route = {
    id: 'route-1',
    name: 'Main Route',
    storeId: 'store-1',
    locations: ['Produce', 'Dairy'],
    userId: 'user-1',
    userIdsWithAccess: [],
  };

  it('adds, updates, and deletes routes for a store', () => {
    const initial = makeState({
      storesList: {
        data: [{ _id: 'store-1', name: 'Store', routes: [] }],
      } as any,
    });

    const added = reduce(initial, addRoute(route));
    expect(added.storesList.data[0].routes).toHaveLength(1);

    const updated = reduce(
      added,
      updateRoute({ ...route, name: 'Updated Route' }),
    );
    expect(updated.storesList.data[0].routes[0].name).toBe('Updated Route');

    const deleted = reduce(updated, deleteRoute(route));
    expect(deleted.storesList.data[0].routes).toEqual([]);
  });

  it('selects the active route and derives unique locations for a store', () => {
    const state = makeState({
      storesList: {
        data: [
          {
            _id: 'store-1',
            routes: [
              route,
              { ...route, id: 'route-2', locations: ['Dairy', 'Frozen'] },
            ],
          },
        ],
      } as any,
      activeRouteIds: { 'store-1': 'route-2' },
    });
    const root = { lists: state } as any;

    expect(routesForStoreSelector('store-1')(root)).toHaveLength(2);
    expect(activeRouteIdSelector('store-1')(root)).toBe('route-2');
    expect(activeRouteSelector('store-1')(root)?.name).toBe('Main Route');
    expect(locationsForStoreSelector('store-1')(root)).toEqual([
      'Produce',
      'Dairy',
      'Frozen',
    ]);
  });

  it('reads a location by route id instead of current store id', () => {
    const state = makeState({
      storeSpecificValuesMap: {
        [item._id]: {
          [StoreSpecificValueKey.Location]: { 'route-1': 'Dairy' },
        },
      },
    });
    const root = { lists: state } as any;

    expect(
      storeSpecificValueForIdSelector(
        item,
        StoreSpecificValueKey.Location,
        'route-1',
      )(root),
    ).toBe('Dairy');
    expect(
      storeSpecificValueForIdSelector(
        item,
        StoreSpecificValueKey.Location,
        'missing-route',
      )(root),
    ).toBeUndefined();
  });

  it('sets the active route id for a store', () => {
    const result = reduce(
      makeState(),
      setActiveRouteId({ storeId: 'store-1', routeId: 'route-1' }),
    );

    expect(result.activeRouteIds['store-1']).toBe('route-1');
  });
});

describe('list, selection, and mutually exclusive reducers', () => {
  it('adds and updates item, store, and store-specific records', () => {
    const state = makeState();
    const firstItem = { ...item, images: ['milk.jpg'] } as any;
    const store = { _id: 'store-1', name: 'Market' } as any;

    const withItem = reduce(
      state,
      addItemsListItem({
        item: firstItem,
        storeSpecificValues: {
          [StoreSpecificValueKey.Quantity]: { 'store-1': 2 },
        },
      }),
    );
    expect(withItem.itemsList.data).toEqual([firstItem]);
    expect(withItem.storeSpecificValuesMap[item._id]).toEqual({
      [StoreSpecificValueKey.Quantity]: { 'store-1': 2 },
    });

    const withItems = reduce(
      withItem,
      addItemsToItemsList({
        data: [secondItem],
        filters: { name: 'bread' },
        sortOrderValue: { sortBy: 'name', sortOrder: 'ascending' },
      } as any),
    );
    expect(withItems.itemsList.data).toHaveLength(2);
    expect(withItems.itemsList.filters).toEqual({ name: 'bread' });

    const withStore = reduce(withItems, addStoresListItem({ newStore: store }));
    expect(withStore.storesList.data).toEqual([store]);
    expect(withStore.currentStoreId).toBe('store-1');

    const merged = reduce(
      withStore,
      addStoreSpecificValues({
        [item._id]: { [StoreSpecificValueKey.Note]: { 'store-1': 'cold' } },
      }),
    );
    expect(merged.storeSpecificValuesMap[item._id]).toMatchObject({
      [StoreSpecificValueKey.Note]: { 'store-1': 'cold' },
    });
  });

  it('handles return items and selection add, remove, and set operations', () => {
    let state = makeState();
    state = reduce(
      state,
      addReturnItem({ storeId: 'store-1', itemKey: item._id }),
    );
    state = reduce(
      state,
      addReturnItem({ storeId: 'store-1', itemKey: item._id }),
    );
    expect(state.returnItems['store-1']).toEqual([item._id]);
    state = reduce(
      state,
      removeReturnItem({ storeId: 'store-1', itemKey: item._id }),
    );
    expect(state.returnItems['store-1']).toEqual([]);

    state = reduce(
      state,
      updateSelectedItemsFromShoppingCart({
        operation: 'add',
        item: item as any,
      }),
    );
    state = reduce(
      state,
      updateSelectedItemsFromInCart({
        operation: 'set',
        item: secondItem as any,
      }),
    );
    state = reduce(
      state,
      updateSelectedItemsFromPreviouslyPurchased({
        operation: 'add',
        item: item as any,
      }),
    );
    expect(state.selectedItemsFromShoppingCart).toEqual([item]);
    expect(state.selectedItemsFromInCart).toEqual([secondItem]);
    expect(state.selectedItemsFromPreviouslyPurchased).toEqual([item]);

    state = reduce(
      state,
      updateSelectedItemsFromShoppingCart({
        operation: 'remove',
        item: item as any,
      }),
    );
    expect(state.selectedItemsFromShoppingCart).toEqual([]);
  });

  it('creates, updates, removes, and accepts mutually exclusive groups', () => {
    let state = withStoreValues(makeState(), item._id, 1);
    withStoreValues(state, secondItem._id, 1);
    state = reduce(
      state,
      addMutuallyExclusiveGroup({
        itemKeys1: [item._id],
        itemKeys2: [secondItem._id],
        name: 'Milk choice',
        quantities1: [2],
        quantities2: [3],
      }),
    );
    const group = state.mutuallyExclusiveGroups[0];
    expect(group.quantities1).toEqual([2]);
    expect(
      reduce(
        state,
        addMutuallyExclusiveGroup({
          itemKeys1: [secondItem._id],
          itemKeys2: [item._id],
          name: 'Duplicate',
        }),
      ).mutuallyExclusiveGroups,
    ).toHaveLength(1);

    state = reduce(
      state,
      updateMutuallyExclusiveGroup({
        id: group.id,
        itemKeys1: [item._id, 'new-item'],
        itemKeys2: [secondItem._id],
        name: 'Updated',
        quantities1: [2, 4],
        quantities2: [3],
      }),
    );
    expect(
      state.storeSpecificValuesMap['new-item']?.quantity?.['store-1'],
    ).toBe(4);
    expect(
      state.storeSpecificValuesMap['new-item']?.isInCart?.['store-1'],
    ).toBe(false);

    state = reduce(
      state,
      removeItemFromMutuallyExclusiveGroup({
        groupId: group.id,
        side: 1,
        itemKey: 'new-item',
      }),
    );
    expect(
      state.storeSpecificValuesMap['new-item']?.quantity?.['store-1'],
    ).toBe(0);

    state = reduce(state, removeMutuallyExclusiveGroup({ id: group.id }));
    expect(state.mutuallyExclusiveGroups).toEqual([]);

    state = makeState({
      mutuallyExclusiveGroups: [
        {
          id: 'group-2',
          itemKeys1: [item._id],
          itemKeys2: [secondItem._id],
          name: 'Choice',
          quantities1: [2],
          quantities2: [1],
          storeId: 'store-1',
        },
      ],
    });
    state = withStoreValues(state, item._id, 0);
    withStoreValues(state, secondItem._id, 0);
    state = reduce(
      state,
      acceptMutuallyExclusiveGroupSide({ id: 'group-2', acceptedSide: 1 }),
    );
    expect(state.mutuallyExclusiveGroups).toEqual([]);
    expect(state.storeSpecificValuesMap[item._id]?.quantity?.['store-1']).toBe(
      2,
    );
    expect(
      state.storeSpecificValuesMap[secondItem._id]?.quantity?.['store-1'],
    ).toBe(0);
  });
});

describe('inventory reducers', () => {
  const location = { _id: 'location-1', name: 'Pantry' } as any;
  const secondLocation = { _id: 'location-2', name: 'Basement' } as any;
  const inventoryItem = { expirationDates: { '100': 2, '200': 1 } };

  it('adds, replaces, selects, and removes inventory locations', () => {
    let state = makeState();
    state = reduce(state, addInventoryLocation(location));
    state = reduce(
      state,
      addInventoryLocation({ ...location, name: 'Updated' }),
    );
    state = reduce(state, addInventoryLocations([secondLocation]));
    expect(state.inventory.locations.map((value) => value.name)).toEqual([
      'Updated',
      'Basement',
    ]);
    expect(state.inventory.currentLocationId).toBe('location-2');

    state = reduce(state, removeInventoryLocation(location));
    expect(state.inventory.locations).toHaveLength(1);
    state = reduce(state, removeInventoryLocations([secondLocation]));
    expect(state.inventory.locations).toEqual([]);
    expect(state.inventory.currentLocationId).toBe('');
  });

  it('inserts, moves, transfers, and removes inventory quantities', () => {
    let state = makeState({
      inventory: {
        currentLocationId: 'location-1',
        locations: [location, secondLocation],
        items: { 'location-1': { 'item-1': inventoryItem } },
        lastDecrementedItemId: '',
      } as any,
    });
    state = reduce(
      state,
      insertInventoryItem({
        itemId: 'item-1',
        item: { expirationDates: { '100': 1 } },
      }),
    );
    expect(
      state.inventory.items['location-1']['item-1'].expirationDates['100'],
    ).toBe(3);
    state = reduce(
      state,
      insertInventoryItems([
        {
          itemId: 'item-2',
          locationId: 'location-1',
          item: { expirationDates: { '300': 2 } },
        },
      ]),
    );
    state = reduce(
      state,
      moveInventoryItem({ itemId: 'item-1', targetLocationId: 'location-2' }),
    );
    expect(state.inventory.items['location-2']['item-1']).toBeDefined();

    state = reduce(
      state,
      moveInventoryItemExpirationDates([
        {
          itemId: 'item-2',
          originLocationId: 'location-1',
          targetLocationId: 'location-2',
          expirationDates: ['300'],
        },
      ]),
    );
    expect(
      state.inventory.items['location-2']['item-2'].expirationDates['300'],
    ).toBe(1);

    state = reduce(
      state,
      removeInventoryItem({
        itemId: 'item-2',
        locationId: 'location-2',
        expirationDates: { '300': 1 },
      }),
    );
    expect(state.inventory.items['location-2']['item-2']).toBeUndefined();
    expect(state.inventory.lastDecrementedItemId).toBe('item-2');
  });

  it('processes location maps and removes the most recent inventory item', () => {
    let state = makeState({
      inventory: {
        currentLocationId: 'location-1',
        locations: [location],
        items: {},
        lastDecrementedItemId: '',
      } as any,
    });
    state = reduce(
      state,
      processItemToLocationMap({
        itemToLocationMap: {
          'item-1': {
            locationId: 'location-1',
            quantity: 2,
            timeToExpiration: 1000,
          },
        },
      } as any),
    );
    expect(
      Object.values(
        state.inventory.items['location-1']['item-1'].expirationDates,
      ),
    ).toEqual([2]);
    state = reduce(
      state,
      removeMostRecentInventoryItem({
        itemId: 'item-1',
        locationId: 'location-1',
      }),
    );
    expect(
      Object.values(
        state.inventory.items['location-1']['item-1'].expirationDates,
      ),
    ).toEqual([1]);
  });
});

describe('listsSlice state responses and selectors', () => {
  it('handles load and save responses and marks mismatched values for saving', () => {
    const loadedItem = {
      ...item,
      needsSaving: true,
      hasBeenSaved: false,
    } as any;
    const loadedStore = {
      _id: 'store-1',
      name: 'Market',
      needsSaving: true,
    } as any;
    const state = makeState({
      itemsList: { data: [], filters: {}, sortOrderValue: {} },
      storesList: { data: [], filters: {}, sortOrderValue: {} },
    } as any);
    const loaded = reduce(
      state,
      handleLoadAllResponse({
        items: [loadedItem],
        stores: [loadedStore],
        lastPurchasedMap: { [item._id]: { 'store-1': 5 } },
        storeSpecificValues: { [item._id]: { quantity: { 'store-1': 2 } } },
        settings: {
          currentStoreId: 'store-1',
          sortOrderValues: {
            items: { sortBy: 'name', sortOrder: 'ascending' },
            stores: { sortBy: 'name', sortOrder: 'ascending' },
          },
        },
      } as any),
    );
    expect(loaded.itemsList.data[0].hasBeenSaved).toBe(true);
    expect(loaded.currentStoreId).toBe('store-1');

    const saved = reduce(
      loaded,
      handleSaveAllResponse({
        itemsSaved: [loadedItem],
        storesSaved: [loadedStore],
        itemsResult: { result: { ok: true } },
        storesResult: { result: { ok: true } },
        storeSpecificValuesResult: {
          values: { [item._id]: { quantity: { 'store-1': 99 } } },
        },
      } as any),
    );
    expect(saved.itemsList.data[0].needsSaving).toBe(true);
  });

  it('computes list counts, prices, current store, and store-specific values', () => {
    const state = withStoreValues(
      makeState({
        storesList: {
          data: [{ _id: 'store-1', name: 'Market' }],
          filters: {},
          sortOrderValue: {},
        },
        itemsList: { data: [item], filters: {}, sortOrderValue: {} },
      } as any),
      item._id,
      2,
    );
    state.storeSpecificValuesMap[item._id]![StoreSpecificValueKey.Price] = {
      'store-1': 3,
    };
    state.storeSpecificValuesMap[item._id]![StoreSpecificValueKey.IsInCart] = {
      'store-1': false,
    };
    const root = { lists: state } as any;

    expect(currentStoreSelector(root).name).toBe('Market');
    expect(currentStoreIdSelector(root)).toBe('store-1');
    expect(currentLocationSelector(root)).toBeNull();
    expect(currentLocationStateSelector(root)).toBeDefined();
    expect(itemInListsCountSelector({ itemId: item._id })(root)).toBe(2);
    expect(priceOfItemsSelector(ListName.ShoppingList)(root)).toBe(6);
    expect(
      storeSpecificValuesSelector(item, StoreSpecificValueKey.Quantity)(root),
    ).toBe(2);
    expect(itemsListItemSelector(item._id)(root)).toEqual(item);
    expect(
      itemsListWithStoreSpecificValuesSelector(item._id)(root),
    ).toMatchObject({ name: 'Milk', quantity: { 'store-1': 2 } });
  });

  it('selects inventory data and applies state reset/set actions', () => {
    const inventoryItemWithDetails = { expirationDates: { '100': 1 } };
    const state = makeState({
      itemsList: {
        data: [item] as any,
        filters: {},
        sortOrderValue: {} as any,
      },
      inventory: {
        currentLocationId: 'location-1',
        locations: [{ _id: 'location-1', name: 'Pantry' }],
        items: { 'location-1': { [item._id]: inventoryItemWithDetails } },
        lastDecrementedItemId: 'item-1',
      } as any,
    });
    const root = { lists: state } as any;
    expect(currentInventoryLocationIdSelector(root)).toBe('location-1');
    expect(currentInventoryLocationSelector(root)?.name).toBe('Pantry');
    expect(currentInventoryLocationItemsSelector(root)[item._id].item).toEqual(
      item,
    );
    expect(
      inventoryItemSelector({ itemId: item._id })(root).inventoryItem,
    ).toEqual(inventoryItemWithDetails);
    expect(inventorySelector(root).currentLocationId).toBe('location-1');
    expect(inventoryItemsSelector(root)).toBe(state.inventory.items);
    expect(inventoryLocationsSelector(root)).toBe(state.inventory.locations);

    let result = reduce(state, setCurrentInventoryLocationId(null));
    result = reduce(
      result,
      setInventory({ items: {}, locations: [], currentLocationId: null }),
    );
    result = reduce(result, resetInventoryItems());
    result = reduce(result, resetInventoryLocations());
    result = reduce(result, setLastDecrementedItemId('item-9'));
    result = reduce(result, resetLastPurchasedMap());
    result = reduce(result, resetItemsList());
    result = reduce(result, resetStoresList());
    expect(result.inventory.items).toEqual({});
    expect(result.inventory.locations).toEqual([]);
    expect(result.inventory.lastDecrementedItemId).toBe('item-9');
    expect(result.currentStoreId).toBe('');
    expect(result.lastPurchasedMap).toEqual({});
  });
});

describe('listsSlice state controls and derived lists', () => {
  it('clears shopping state and copies non-cart values between stores', () => {
    let state = withStoreValues(
      makeState({
        mutuallyExclusiveGroups: [
          {
            id: 'group-1',
            itemKeys1: [item._id],
            itemKeys2: [secondItem._id],
            quantities1: [1],
            quantities2: [1],
            storeId: 'store-1',
          },
        ],
        returnItems: { 'store-1': [item._id] },
      }),
      item._id,
      2,
      true,
    );
    state.storeSpecificValuesMap[item._id]![StoreSpecificValueKey.Note] = {
      'store-1': 'cold',
    };
    state.storeSpecificValuesMap[item._id]![StoreSpecificValueKey.Price] = {
      'store-1': 4,
    };
    state.lastPurchasedMap = { [item._id]: { 'store-1': 10 } };

    state = reduce(state, clearShopping());
    expect(state.mutuallyExclusiveGroups).toEqual([]);
    expect(state.returnItems['store-1']).toBeUndefined();
    expect(state.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      false,
    );
    expect(state.storeSpecificValuesMap[item._id]?.quantity?.['store-1']).toBe(
      0,
    );

    const copied = reduce(
      state,
      copyStoreSpecificValues({
        source: { _id: 'store-1' } as any,
        destination: { _id: 'store-2' } as any,
      }),
    );
    expect(copied.storeSpecificValuesMap[item._id]?.note?.['store-2']).toBe(
      'cold',
    );
    expect(copied.storeSpecificValuesMap[item._id]?.price?.['store-2']).toBe(4);
    expect(copied.lastPurchasedMap[item._id]?.['store-2']).toBe(10);
  });

  it('moves items across stores and supports previously purchased selection movement', () => {
    let state = withStoreValues(
      makeState({
        selectedItemsFromPreviouslyPurchased: [item] as any,
        isMultiSelectModeForPreviouslyPurchased: true,
      }),
      item._id,
      2,
      true,
    );
    state = reduce(
      state,
      moveItemToAnotherCart({
        item: item as any,
        store: { _id: 'store-2', name: 'Other' } as any,
      }),
    );
    expect(state.storeSpecificValuesMap[item._id]?.quantity?.['store-2']).toBe(
      2,
    );
    expect(state.storeSpecificValuesMap[item._id]?.quantity?.['store-1']).toBe(
      0,
    );
    expect(state.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      false,
    );

    state = reduce(state, moveSelectedPreviouslyPurchasedItemsToShopping());
    expect(state.storeSpecificValuesMap[item._id]?.quantity?.['store-1']).toBe(
      1,
    );
    expect(state.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      false,
    );
    expect(state.selectedItemsFromPreviouslyPurchased).toEqual([]);
    expect(state.isMultiSelectModeForPreviouslyPurchased).toBe(false);

    state = reduce(state, moveAllToInCart());
    expect(state.storeSpecificValuesMap[item._id]?.isInCart?.['store-1']).toBe(
      true,
    );
  });

  it('updates filters, sorting, mode flags, location, and list state', () => {
    let state = makeState({
      shoppingList: {
        data: [item],
        filters: {},
        sortOrderValue: { sortBy: 'name', sortOrder: 'Ascending' },
      },
      storesList: {
        data: [{ _id: 'store-1', name: 'Market' }],
        filters: {},
        sortOrderValue: {},
      },
    } as any);
    state = reduce(
      state,
      setFilters({
        listName: ListName.ShoppingList,
        filters: { name: 'milk', empty: '' },
      } as any),
    );
    expect(state.shoppingList.filters).toEqual({ name: 'milk' });
    state = reduce(state, toggleSortOrder({ listName: ListName.ShoppingList }));
    expect(state.shoppingList.sortOrderValue.sortOrder).toBe('Descending');
    state = reduce(
      state,
      setSortOrder({
        listName: ListName.ShoppingList,
        sortBy: 'price',
        sortOrder: 'Ascending',
      } as any),
    );
    expect(state.shoppingList.sortOrderValue).toEqual({
      sortBy: 'price',
      sortOrder: 'Ascending',
    });

    const coordinate = { latitude: 1, longitude: 2 } as any;
    state = reduce(state, setCurrentLocation(coordinate));
    expect(state.currentLocation).toEqual(coordinate);
    expect(state.storesList.data[0].calculatedDistance).toBe(12);
    state = reduce(state, resetCurrentLocation());
    expect(state.currentLocation).toBeNull();
    expect(state.storesList.data[0].calculatedDistance).toBe(-1);
    state = reduce(state, setCurrentLocationState('CA' as any));
    expect(state.currentLocationState).toBe('CA');
    state = reduce(state, resetCurrentLocationState());
    expect(state.currentLocationState).toBe('Select a State');

    state = reduce(state, setIsMultiSelectModeForInCartCart(true));
    state = reduce(state, setIsMultiSelectModeForShoppingCart(true));
    state = reduce(state, setIsMultiSelectModeForPreviouslyPurchased(true));
    expect(state.isMultiSelectModeForInCart).toBe(true);
    expect(state.isMultiSelectModeForShoppingCart).toBe(true);
    expect(state.isMultiSelectModeForPreviouslyPurchased).toBe(true);

    state = reduce(
      state,
      setItemsList({
        data: [secondItem],
        filters: {},
        sortOrderValue: {},
      } as any),
    );
    state = reduce(
      state,
      setStoresList({
        data: [],
        filters: {},
        sortOrderValue: {},
        currentStoreId: 'store-9',
      } as any),
    );
    state = reduce(state, setStoreSpecificValues({ [secondItem._id]: {} }));
    state = reduce(
      state,
      setLastPurchasedMap({ [secondItem._id]: { 'store-9': 1 } }),
    );
    state = reduce(state, setMutuallyExclusiveGroups([]));
    state = reduce(state, setReturnItems({ 'store-9': [secondItem._id] }));
    state = reduce(state, setCurrentStoreId('store-10'));
    expect(state.currentStoreId).toBe('store-10');
    expect(state.itemsList.data).toEqual([secondItem]);
    expect(state.returnItems['store-9']).toEqual([secondItem._id]);
  });

  it('derives display lists, store counts, and purchase recommendations', () => {
    const state = makeState({
      storesList: {
        data: [{ _id: 'store-1', name: 'Market' }],
        filters: {},
        sortOrderValue: {},
      },
      itemsList: {
        data: [item, secondItem],
        filters: {},
        sortOrderValue: { sortBy: 'name', sortOrder: 'Ascending' },
      },
      shoppingList: {
        data: [],
        filters: {},
        sortOrderValue: { sortBy: 'name', sortOrder: 'Ascending' },
      },
      previouslyPurchased: {
        data: [],
        filters: {},
        sortOrderValue: { sortBy: 'name', sortOrder: 'Ascending' },
      },
      storeSpecificValuesMap: {
        [item._id]: {
          quantity: { 'store-1': 2 },
          isInCart: { 'store-1': false },
          price: { 'store-1': 3 },
        },
        [secondItem._id]: {
          quantity: { 'store-1': 1 },
          isInCart: { 'store-1': true },
          price: { 'store-1': 5 },
        },
      },
      lastPurchasedMap: { [item._id]: { 'store-1': 5 } },
      returnItems: { 'store-1': [secondItem._id] },
      mutuallyExclusiveGroups: [
        {
          id: 'group-1',
          itemKeys1: [item._id],
          itemKeys2: [secondItem._id],
          quantities1: [1],
          quantities2: [1],
          storeId: 'store-1',
        },
      ],
    } as any);
    const root = { lists: state } as any;
    expect(listToDisplaySelector(ListName.ItemsList)(root)).toHaveLength(2);
    expect(storeSpecificListSelector(ListName.ShoppingList)(root)).toHaveLength(
      1,
    );
    expect(storeSpecificListSelector(ListName.InCartList)(root)).toHaveLength(
      1,
    );
    expect(storeItemsCountSelector('store-1')(root)).toBe(4);
    expect(storeItemsCountSelector('')(root)).toBe(0);
    expect(priceOfItemsSelector(ListName.ShoppingList)(root)).toBe(6);
    expect(priceOfItemsSelector(ListName.InCartList)(root)).toBe(5);
    expect(itemsPurchasedAtStoreSelector(root)).toHaveLength(1);
    expect(previouslyPurchasedListSelector(root)).toBe(
      state.previouslyPurchased,
    );
    expect(returnItemsSelector(root)).toEqual({ 'store-1': [secondItem._id] });
  });

  it('handles bulk inventory/list removal and selection resets', () => {
    let state = makeState({
      shoppingList: {
        data: [item],
        filters: { name: 'milk' },
        sortOrderValue: { sortBy: 'name', sortOrder: 'Ascending' },
      },
      storesList: {
        data: [{ _id: 'store-1', name: 'Market' }],
        filters: {},
        sortOrderValue: {},
      },
      selectedItemsFromShoppingCart: [item] as any,
      selectedItemsFromInCart: [secondItem] as any,
      selectedItemsFromPreviouslyPurchased: [item] as any,
      inventory: {
        currentLocationId: 'location-1',
        locations: [],
        items: {
          'location-1': {
            [item._id]: { expirationDates: { '100': 1 } },
          },
        },
        lastDecrementedItemId: '',
      },
    } as any);
    state = withStoreValues(state, item._id, 1);
    state.itemsList.data = [{ ...item, images: ['milk.jpg'] } as any];
    state = reduce(state, removeItemsListItems([item] as any));
    expect(state.itemsList.data).toEqual([]);
    expect(state.inventory.items['location-1'][item._id]).toBeUndefined();

    state.storesList.data = [{ _id: 'store-1', name: 'Market' }] as any;
    state = reduce(
      state,
      removeStoresListItems([{ _id: 'store-1', name: 'Market' }] as any),
    );
    expect(state.storesList.data).toEqual([]);

    state.inventory.items['location-1'] = {
      [secondItem._id]: { expirationDates: { '100': 1 } },
    } as any;
    state = reduce(
      state,
      removeInventoryItems([
        {
          itemId: secondItem._id,
          locationId: 'location-1',
          expirationDates: { '100': 1 },
        },
      ] as any),
    );
    expect(state.inventory.items['location-1'][secondItem._id]).toBeUndefined();

    const moved = reduce(
      makeState({
        inventory: {
          currentLocationId: 'location-1',
          locations: [],
          items: {
            'location-1': {
              [secondItem._id]: { expirationDates: { '100': 1 } },
            },
          },
          lastDecrementedItemId: '',
        },
      } as any),
      moveInventoryItems([
        {
          itemId: secondItem._id,
          originLocationId: 'location-1',
          targetLocationId: 'location-2',
        },
      ]),
    );
    expect(moved.inventory.items['location-2'][secondItem._id]).toBeDefined();

    state = reduce(
      state,
      resetListToDisplayFilters({ listName: ListName.ShoppingList }),
    );
    expect(state.shoppingList.data).toEqual([item]);
    expect(state.shoppingList.filters).toEqual({});
    state = reduce(state, resetSelectedItemsInShopping());
    expect(state.selectedItemsFromShoppingCart).toEqual([]);
    expect(state.selectedItemsFromInCart).toEqual([]);
    expect(state.selectedItemsFromPreviouslyPurchased).toEqual([]);
    expect(shoppingListSelector({ lists: state } as any)).toBe(
      state.shoppingList,
    );
  });

  it('ignores empty payloads and resets each selectable display list', () => {
    let state = makeState({
      selectedItemsFromInCart: [item] as any,
      selectedItemsFromPreviouslyPurchased: [item] as any,
      selectedItemsFromShoppingCart: [item] as any,
      isMultiSelectModeForInCart: true,
      isMultiSelectModeForPreviouslyPurchased: true,
      isMultiSelectModeForShoppingCart: true,
    });
    state = reduce(state, addItemToCart(undefined as any));
    state = reduce(
      makeState({ mutuallyExclusiveGroups: undefined as any }),
      acceptMutuallyExclusiveGroupSide({ id: 'missing', acceptedSide: 1 }),
    );
    expect(state.mutuallyExclusiveGroups).toEqual([]);

    state = makeState({
      selectedItemsFromInCart: [item] as any,
      selectedItemsFromPreviouslyPurchased: [item] as any,
      selectedItemsFromShoppingCart: [item] as any,
      isMultiSelectModeForInCart: true,
      isMultiSelectModeForPreviouslyPurchased: true,
      isMultiSelectModeForShoppingCart: true,
    });
    state = reduce(
      state,
      resetListToDisplay({ listName: ListName.InCartList }),
    );
    state = reduce(
      state,
      resetListToDisplay({ listName: ListName.PreviouslyPurchased }),
    );
    expect(state.selectedItemsFromInCart).toEqual([]);
    expect(state.selectedItemsFromPreviouslyPurchased).toEqual([]);
    expect(state.isMultiSelectModeForInCart).toBe(false);
    expect(state.isMultiSelectModeForPreviouslyPurchased).toBe(false);

    state = reduce(
      state,
      setFilters({ listName: ListName.ShoppingList, filters: {} } as any),
    );
    state = reduce(state, setCurrentLocation(undefined as any));
    state = reduce(state, setCurrentLocationState(undefined as any));
    state = reduce(state, setCurrentStoreId(undefined));
    state = reduce(
      state,
      setInventory({ items: undefined, locations: undefined } as any),
    );
    state = reduce(state, setItemsList(undefined as any));
    state = reduce(state, setLastPurchasedMap(undefined as any));
    state = reduce(state, setStoreSpecificValues(undefined as any));
    expect(state.currentStoreId).toBe('store-1');
  });
});
