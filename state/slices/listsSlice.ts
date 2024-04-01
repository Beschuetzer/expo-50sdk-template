import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import { ListFilterFilters } from '@/components/lists/ListFilter';
import { SortOrder, SortType, getSorter } from '@/components/lists/sorters';
import { EMPTY_STRING } from '@/constants/general';
import {
  Item,
  ItemWithStoreSpecificValues,
  ItemsList,
  Key,
  LastPurchasedMap,
  ShoppingList,
  StoreList,
  StoreSpecificValue,
  StoreSpecificValueKey,
  StoreSpecificValueUpdater,
  StoreSpecificValues,
  StoreSpecificValuesMap,
} from '@/types/Item';
import { GpsCoordinate, Store } from '@/types/Store';
import { ListNameProp, StoreProp } from '@/types/general';
import {
  calculateDistance,
  deleteImages,
  displayAlert,
  getEmptyArray,
  getEmptyList,
  getEmptyObject,
  getFilteredList,
  getItemFromList,
  getKeyToUse,
  getStoreWithDistance,
} from '@/utils/helpers';
import { getItemWithStoreSpecificValues } from '@/utils/model-mappings';

export enum ListName {
  InCartList = 'inCartList',
  ItemsList = 'itemsList',
  PreviouslyPurchased = 'previouslyPurchased',
  ShoppingList = 'shoppingList',
  StoresList = 'storesList',
}

export type SortOrders = {
  [key in ListName]: SortOrderValue;
};
export type SortOrderValue = { sortBy: SortType; sortOrder: SortOrder };

//#region Payloads
export type AddAllToShoppingCartPayload = Item[];

export type AddItemsListItemPayload = {
  item: Item;
  storeSpecificValues?: StoreSpecificValues;
  currentStore?: Store;
  originalKey?: Key;
};

export type AddStoresListItemPayload = {
  newStore: Store;
} & StoreProp;

export type ResetListToDisplayFiltersPayload = ListNameProp;

export type ResetListToDisplayPayload = ListNameProp;

export type SetFiltersPayload = {
  filters: ListFilterFilters<any>;
} & ListNameProp;

export type SetSortOrderPayload = object &
  ListNameProp &
  Partial<Pick<SortOrderValue, 'sortOrder' | 'sortBy'>>;

export type ToggleSortOrderPayload = Pick<SetSortOrderPayload, 'listName'>;
export type UpdateSelectedItemsPayload<T> = {
  operation: 'add' | 'remove' | 'set';
  item: T | undefined;
};
export type UpdateStoreSpecificValuesPayload = {
  /**
   *The key to get the item from {@link ItemsList itemsList}
   **/
  key: Key;
  /**
   *The new value for each store specific value
   **/
  storeSpecificValuesToUpdate: StoreSpecificValueUpdater;
};
//#endregion

//#region State
const CURRENT_LOCATION_INITIAL = null;
const IS_MULTI_SELECT_MODE_FOR_SHOPPING_CART_INITIAL = false;

/**
 * {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
 * {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
 * {@link ListsState.shoppingList shoppingList} is the items currently being bought
 * {@link ListsState.stores stores} is a list of the stores created
 **/
export type ListsState = {
  currentLocation: GpsCoordinate | null;
  currentStoreName: string;
  [ListName.InCartList]: ShoppingList;
  [ListName.ItemsList]: ItemsList;
  [ListName.PreviouslyPurchased]: StoreList;
  [ListName.ShoppingList]: ShoppingList;
  [ListName.StoresList]: StoreList;
  lastPurchasedMap: LastPurchasedMap;
  isMultiSelectModeForShoppingCart: boolean;
  isMultiSelectModeForPreviouslyPurchased: boolean;
  isMultiSelectModeForInCart: boolean;
  selectedItemsFromPreviouslyPurchased: ItemWithStoreSpecificValues[];
  selectedItemsFromShoppingCart: ItemWithStoreSpecificValues[];
  selectedItemsFromInCart: ItemWithStoreSpecificValues[];
  storeSpecificValuesMap: StoreSpecificValuesMap;
};

const initialState: ListsState = {
  currentLocation: CURRENT_LOCATION_INITIAL,
  currentStoreName: EMPTY_STRING,
  isMultiSelectModeForInCart: IS_MULTI_SELECT_MODE_FOR_SHOPPING_CART_INITIAL,
  isMultiSelectModeForPreviouslyPurchased:
    IS_MULTI_SELECT_MODE_FOR_SHOPPING_CART_INITIAL,
  isMultiSelectModeForShoppingCart:
    IS_MULTI_SELECT_MODE_FOR_SHOPPING_CART_INITIAL,
  [ListName.InCartList]: getEmptyList(ListName.InCartList),
  [ListName.ItemsList]: getEmptyList(ListName.ItemsList),
  [ListName.PreviouslyPurchased]: getEmptyList(ListName.PreviouslyPurchased),
  [ListName.ShoppingList]: getEmptyList(ListName.ShoppingList),
  [ListName.StoresList]: getEmptyList(ListName.StoresList),
  lastPurchasedMap: getEmptyObject(),
  selectedItemsFromPreviouslyPurchased: getEmptyArray(),
  selectedItemsFromShoppingCart: getEmptyArray(),
  selectedItemsFromInCart: getEmptyArray(),
  storeSpecificValuesMap: getEmptyObject(),
};
//#endregion

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    addAllToShoppingCart: (
      state: ListsState,
      action: PayloadAction<AddAllToShoppingCartPayload>,
    ) => {
      const items = action.payload;
      if (!items || items.length <= 0) return;

      const storeSpecificValuesToUpdate = {
        quantity: (currentQuantity: number) =>
          currentQuantity > 0 ? currentQuantity + 1 : 1,
      } as StoreSpecificValueUpdater;

      for (const item of items) {
        updateStoreSpecificValueMap(state, item, storeSpecificValuesToUpdate);
      }
    },
    addItemToCart: (
      state: ListsState,
      action: PayloadAction<ItemWithStoreSpecificValues>,
    ) => {
      const itemToAdd = action.payload;
      const keyToUse = getKeyToUse(itemToAdd);
      if (!itemToAdd) return;
      // console.log({
      //   keyToUse,
      //   item: state.storeSpecificValuesMap[keyToUse],
      //   entry:
      //     state.storeSpecificValuesMap[keyToUse]?.[
      //       StoreSpecificValueKey.IsInCart
      //     ],
      // })

      if (!state.storeSpecificValuesMap?.[keyToUse]) {
        state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues;
      }
      if (
        !state.storeSpecificValuesMap?.[keyToUse]?.[
          StoreSpecificValueKey.IsInCart
        ]
      ) {
        (state.storeSpecificValuesMap[keyToUse] as any)[
          StoreSpecificValueKey.IsInCart
        ] = {} as StoreSpecificValue<boolean>;
      }

      (
        (state.storeSpecificValuesMap[keyToUse] as any)[
          StoreSpecificValueKey.IsInCart
        ] as any
      )[state.currentStoreName] = true;
    },
    addItemsListItem: (
      state: ListsState,
      action: PayloadAction<AddItemsListItemPayload>,
    ) => {
      const { originalKey, item, storeSpecificValues, currentStore } =
        action.payload || {};
      const keyToUse = getKeyToUse(action.payload.item);

      if (!keyToUse) {
        alert(
          'Unable to add an item with no name and no upc to the itemsList.',
        );
        return;
      }

      const currentItem = getItemFromList(
        state.itemsList.data,
        keyToUse,
      ) as any;
      const newItem = { ...item } as any;

      //add store specific values if they exist
      if (storeSpecificValues && currentStore?.name) {
        if (!state.storeSpecificValuesMap[keyToUse]) {
          state.storeSpecificValuesMap[keyToUse] = {
            ...storeSpecificValues,
          };
        } else {
          for (const [storeSpecificValueKey, value] of Object.entries(
            storeSpecificValues,
          )) {
            (state.storeSpecificValuesMap as any)[keyToUse][
              storeSpecificValueKey
            ] = {
              ...((state.storeSpecificValuesMap as any)?.[keyToUse]?.[
                storeSpecificValueKey
              ]
                ? (state.storeSpecificValuesMap as any)[keyToUse][
                    storeSpecificValueKey
                  ]
                : {}),
              ...(value || {}),
            };
          }
        }
      }

      //update item if it exists otherwise add it
      if (!currentItem) {
        state.itemsList.data.push(newItem);
      } else {
        for (const [key, value] of Object.entries(item)) {
          currentItem[key] = value;
        }
      }

      //remove original item if the key for new item is different
      const originalKeyToUse = getKeyToUse(originalKey || EMPTY_STRING);
      if (originalKeyToUse && keyToUse && originalKeyToUse !== keyToUse) {
        state.itemsList.data = state.itemsList.data.filter(
          (item) => getKeyToUse(item) !== originalKeyToUse,
        );
      }
    },
    addStoresListItem: (
      state: ListsState,
      action: PayloadAction<AddStoresListItemPayload>,
    ) => {
      const { newStore, store } = action.payload;
      const keyToUse = getKeyToUse(newStore);
      if (!keyToUse) {
        alert('Unable to add an item with no name to the storesList.');
        return;
      }

      const storeIndex = state.storesList.data.findIndex(
        (store) => store.name === keyToUse,
      );

      if (storeIndex !== -1) {
        state.storesList.data[storeIndex] = getStoreWithDistance(
          newStore,
          state.currentLocation,
        );
        return;
      }
      state.storesList.data.push(
        getStoreWithDistance(newStore, state.currentLocation),
      );

      if (state.storesList.data.length === 1) {
        state.currentStoreName = newStore.name;
      }
      if (store) {
        state[ListName.StoresList].data = state[
          ListName.StoresList
        ].data.filter((storeLocal) => storeLocal.name !== store.name);
      }
    },
    clearShopping: (state: ListsState) => {
      for (const [, value] of Object.entries(state.storeSpecificValuesMap)) {
        if (value?.[StoreSpecificValueKey.IsInCart]?.[state.currentStoreName]) {
          value[StoreSpecificValueKey.IsInCart][state.currentStoreName] = false;
        }
        if (value?.[StoreSpecificValueKey.Quantity]?.[state.currentStoreName]) {
          value[StoreSpecificValueKey.Quantity][state.currentStoreName] = 0;
        }
      }
    },
    completePurchase: (state: ListsState) => {
      const { currentStoreName, storeSpecificValuesMap } = state;
      for (const key of Object.keys(storeSpecificValuesMap)) {
        if (
          storeSpecificValuesMap[key]?.[StoreSpecificValueKey.IsInCart]?.[
            currentStoreName
          ]
        ) {
          state.lastPurchasedMap[key] = {
            ...state.lastPurchasedMap[key],
            [state.currentStoreName]: Date.now(),
          };

          (storeSpecificValuesMap[key] as any) = {
            ...(storeSpecificValuesMap[key] as any),
            [StoreSpecificValueKey.IsInCart]: {
              ...(storeSpecificValuesMap[key] as any)[
                StoreSpecificValueKey.IsInCart
              ],
              [currentStoreName]: false,
            },
            [StoreSpecificValueKey.Quantity]: {
              ...(storeSpecificValuesMap[key] as any)[
                StoreSpecificValueKey.Quantity
              ],
              [currentStoreName]: 0,
            },
          };
        }
      }
    },
    migrateItems: (state: ListsState) => {
      for (const key of Object.keys(state.storeSpecificValuesMap)) {
        if ((state.storeSpecificValuesMap?.[key] as any)?.['aisle']) {
          (state.storeSpecificValuesMap[key] as any)[
            StoreSpecificValueKey.AisleNumber
          ] =
            (state.storeSpecificValuesMap?.[key] as any)?.['aisle'] ||
            ({} as any);
          delete (state.storeSpecificValuesMap?.[key] as any)['aisle'];
        }
      }
    },
    moveAllToInCart: (state: ListsState) => {
      moveItems(state, Object.keys(state.storeSpecificValuesMap));
      state.selectedItemsFromShoppingCart = [];
    },
    moveItemToShoppingList: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!state.storeSpecificValuesMap?.[keyToUse]) {
        state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues;
      }
      if (
        !state.storeSpecificValuesMap?.[keyToUse]?.[
          StoreSpecificValueKey.IsInCart
        ]
      ) {
        (state.storeSpecificValuesMap[keyToUse] as any)[
          StoreSpecificValueKey.IsInCart
        ] = {} as StoreSpecificValue<boolean>;
      }

      (state.storeSpecificValuesMap[keyToUse] as any)[
        StoreSpecificValueKey.IsInCart
      ][state.currentStoreName] = false;
    },
    moveSelectedToCart: (state: ListsState) => {
      moveItems(
        state,
        state.selectedItemsFromShoppingCart.map((item) => getKeyToUse(item)),
      );
      state.isMultiSelectModeForShoppingCart = false;
      state.selectedItemsFromShoppingCart = [];
    },
    moveSelectedToShopping: (state: ListsState) => {
      moveItems(
        state,
        state.selectedItemsFromInCart.map((item) => getKeyToUse(item)),
        false,
      );
      state.isMultiSelectModeForInCart = false;
      state.selectedItemsFromInCart = [];
    },
    moveSelectedPreviouslyPurchasedItemsToShopping: (state: ListsState) => {
      moveItems(
        state,
        state.selectedItemsFromPreviouslyPurchased.map((item) =>
          getKeyToUse(item),
        ),
        false,
        true,
      );
      state.isMultiSelectModeForPreviouslyPurchased = false;
      state.selectedItemsFromPreviouslyPurchased = [];
    },
    removeItemsListItems: (
      state: ListsState,
      action: PayloadAction<Item[]>,
    ) => {
      const keysToUse = action.payload.map((item) => getKeyToUse(item));
      if (!keysToUse) {
        alert(
          'A list ofkey must be provided in order to remove them from the itemsList.',
        );
        return;
      }

      state.itemsList.data = state.itemsList.data.filter((item) => {
        if (item.upc && item.name) {
          const isMatch = !keysToUse.includes(item.upc);
          if (!isMatch) {
            deleteImages(item.images);
          }
          return isMatch;
        }
        const isMatch = !keysToUse.includes(item?.name || EMPTY_STRING);
        if (!isMatch) {
          deleteImages(item.images);
        }
        return isMatch;
      });

      for (const keyToUse of keysToUse) {
        state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues;
      }
    },
    removeStoresListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          'A key must be provided in order to remove an item from the storesList.',
        );
        return;
      }
      state.storesList.data = state.storesList.data.filter(
        (store) => store.name !== keyToUse,
      );
    },
    resetCurrentLocation: (state: ListsState) => {
      state.currentLocation = CURRENT_LOCATION_INITIAL;
      for (const store of state.storesList.data) {
        store.calculatedDistance = -1;
      }
    },
    resetListToDisplay: (
      state: ListsState,
      action: PayloadAction<ResetListToDisplayPayload>,
    ) => {
      const { listName } = action.payload;
      const emptyList = getEmptyList<any>(listName);
      emptyList.data = state[listName]?.data || [];
      state[listName] = emptyList;
    },
    resetListToDisplayFilters: (
      state: ListsState,
      action: PayloadAction<ResetListToDisplayFiltersPayload>,
    ) => {
      const { listName } = action.payload;
      const emptyList = getEmptyList<any>(listName);
      emptyList.data = state[listName].data || [];
      emptyList.sortOrderValue = state[listName].sortOrderValue;
      state[listName] = emptyList;
    },
    resetItemsList: (state: ListsState) => {
      state.itemsList = getEmptyList(ListName.ItemsList);
      state.storeSpecificValuesMap = {};
    },
    resetListSlice: (state: ListsState) => {
      state = initialState;
    },
    resetLastPurchasedMap: (state: ListsState) => {
      state.lastPurchasedMap = getEmptyObject();
    },
    resetStoresList: (state: ListsState) => {
      state.storesList = getEmptyList(ListName.StoresList);
      state.currentStoreName = EMPTY_STRING;
    },
    resetCurrentStoreName: (state: ListsState) => {
      state.currentStoreName = EMPTY_STRING;
    },
    setCurrentLocation: (
      state: ListsState,
      action: PayloadAction<GpsCoordinate>,
    ) => {
      if (!action.payload) return;
      state.currentLocation = action.payload;
      for (const store of state.storesList.data) {
        store.calculatedDistance = calculateDistance(
          state.currentLocation,
          store.gpsCoordinates,
        );
      }
    },
    setCurrentStoreName: (
      state: ListsState,
      action: PayloadAction<string | undefined>,
    ) => {
      if (!action.payload) return;
      state.currentStoreName = action.payload;
    },
    setFilters: (
      state: ListsState,
      action: PayloadAction<SetFiltersPayload>,
    ) => {
      const { filters, listName } = action.payload;

      if (!listName || Object.keys(filters || {}).length === 0) {
        return;
      }

      for (const [key, value] of Object.entries(filters)) {
        if (!value) {
          delete filters[key];
        }
      }

      state[listName].filters = filters;
    },
    setItemsList: (
      state: ListsState,
      action: PayloadAction<ListsState['itemsList']>,
    ) => {
      if (!action.payload) return;
      state.itemsList = action.payload;
    },
    setSortOrder: (
      state: ListsState,
      action: PayloadAction<SetSortOrderPayload>,
    ) => {
      const { listName, sortBy, sortOrder } = action.payload;
      const listToSort = state[listName];

      if (!listToSort) {
        alert(`Unable to find a list with name of '${listName}'.`);
        return;
      }

      const newSortBy = sortBy || state[listName].sortOrderValue.sortBy;
      const newSortOrder =
        sortOrder || state[listName].sortOrderValue.sortOrder;
      listToSort.data?.sort(
        getSorter(newSortBy, state.currentStoreName, newSortOrder),
      );

      state[listName].sortOrderValue = {
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      };
    },
    setStoresList: (
      state: ListsState,
      action: PayloadAction<ListsState['storesList']>,
    ) => {
      if (!action.payload) return;
      state[ListName.StoresList] = action.payload;
    },
    setStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<ListsState['storeSpecificValuesMap']>,
    ) => {
      if (!action.payload) return;
      state.storeSpecificValuesMap = action.payload;
    },
    setIsMultiSelectModeForInCartCart: (
      state: ListsState,
      action: PayloadAction<boolean>,
    ) => {
      state.isMultiSelectModeForInCart = action.payload;
    },
    setIsMultiSelectModeForShoppingCart: (
      state: ListsState,
      action: PayloadAction<boolean>,
    ) => {
      state.isMultiSelectModeForShoppingCart = action.payload;
    },
    setIsMultiSelectModeForPreviouslyPurchased: (
      state: ListsState,
      action: PayloadAction<boolean>,
    ) => {
      state.isMultiSelectModeForPreviouslyPurchased = action.payload;
    },
    toggleSortOrder: (
      state: ListsState,
      action: PayloadAction<ToggleSortOrderPayload>,
    ) => {
      const { listName } = action.payload;

      if (!state[listName].sortOrderValue) return;
      const sortOrder =
        state[listName].sortOrderValue?.sortOrder === SortOrder.Ascending
          ? SortOrder.Descending
          : SortOrder.Ascending;

      state[listName].sortOrderValue.sortOrder = sortOrder;
    },
    updateSelectedItemsFromInCart: (
      state: ListsState,
      action: PayloadAction<
        UpdateSelectedItemsPayload<ItemWithStoreSpecificValues>
      >,
    ) => {
      updateSelectedItems(state, action, ListName.InCartList);
    },
    updateSelectedItemsFromShoppingCart: (
      state: ListsState,
      action: PayloadAction<
        UpdateSelectedItemsPayload<ItemWithStoreSpecificValues>
      >,
    ) => {
      updateSelectedItems(state, action, ListName.ShoppingList);
    },
    updateSelectedItemsFromPreviouslyPurchased: (
      state: ListsState,
      action: PayloadAction<
        UpdateSelectedItemsPayload<ItemWithStoreSpecificValues>
      >,
    ) => {
      updateSelectedItems(state, action, 'previouslyPurchased');
    },
    updateStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<UpdateStoreSpecificValuesPayload>,
    ) => {
      if (!action.payload) return;
      const { storeSpecificValuesToUpdate, key } = action.payload;
      const keyToUse = getKeyToUse(key);
      if (!keyToUse || !storeSpecificValuesToUpdate) {
        alert(
          `A key, storeName, and storeSpecificValuesToUpdate must be provided in order to update an item.`,
        );
        return;
      }

      updateStoreSpecificValueMap(state, key, storeSpecificValuesToUpdate);
    },
  },
});

export const currentLocationSelector = (state: RootState) =>
  state[listsSlice.name].currentLocation;

export const currentStoreSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].storesList.data,
    (state: RootState) => state[listsSlice.name].currentStoreName,
  ],
  (storesList, currentStoreName) => {
    const foundStore = (storesList.find(
      (store) => store.name === currentStoreName,
    ) || {
      name: EMPTY_STRING,
      gpsCoordinates: null,
    }) as Store;
    return foundStore;
  },
);

export const itemsListItemSelector = (id: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].itemsList.data],
    (itemsList) => {
      return getItemFromList(itemsList, id);
    },
  );

export const itemsListWithStoreSpecificValuesSelector = (id: string) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name].itemsList.data,
      (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
    ],
    (itemsListData, storeSpecificValuesMap) => {
      const itemToUse = getItemFromList(itemsListData, id);
      const storeSpecificValuesToUse = storeSpecificValuesMap[id];

      return {
        ...itemToUse,
        ...storeSpecificValuesToUse,
      } as ItemWithStoreSpecificValues;
    },
  );

export const itemsListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.ItemsList];

export const inCartListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.InCartList];

export const isMultiSelectModeForInCartSelector = (state: RootState) =>
  state[listsSlice.name].isMultiSelectModeForInCart;

export const isMultiSelectModeForPreviouslyPurchasedSelector = (
  state: RootState,
) => state[listsSlice.name].isMultiSelectModeForPreviouslyPurchased;

export const isMultiSelectModeForShoppingCartSelector = (state: RootState) =>
  state[listsSlice.name].isMultiSelectModeForShoppingCart;

export const lastPurchasedMapSelector = (state: RootState) =>
  state[listsSlice.name].lastPurchasedMap;

export const lastPurchasedSelector = (key: Key) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name].lastPurchasedMap,
      (state: RootState) => state[listsSlice.name].currentStoreName,
    ],
    (lastPurchasedMap, currentStoreName) => {
      return lastPurchasedMap?.[getKeyToUse(key)]?.[currentStoreName];
    },
  );

/**
 *This should only be used for lists that don't use store specific value sorting
 **/
export const listToDisplaySelector = (listName: ListName) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name]?.[listName]],
    (list) => {
      if (!list) return [];
      const { filters, sortOrderValue, data } = list;

      const filteredList = getFilteredList<unknown>(data, filters);
      filteredList.sort(
        getSorter(sortOrderValue.sortBy, '', sortOrderValue.sortOrder),
      );
      return filteredList;
    },
  );

export const itemsPurchasedAtStoreSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name][ListName.ItemsList],
    (state: RootState) => state[listsSlice.name][ListName.PreviouslyPurchased],
    (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
    (state: RootState) => state[listsSlice.name].lastPurchasedMap,
    (state: RootState) => state[listsSlice.name].currentStoreName,
  ],
  (
    itemsList,
    previouslyPurchasedList,
    storeSpecificValuesMap,
    lastPurchasedMap,
    currentStoreName,
  ) => {
    const previoulsyPurchasedItems: ItemWithStoreSpecificValues[] = [];
    for (const item of itemsList.data) {
      const key = getKeyToUse(item);
      const lastPurchaseDate = lastPurchasedMap?.[key]?.[currentStoreName];
      if (lastPurchaseDate) {
        const storeSpecificValues = storeSpecificValuesMap[key];
        previoulsyPurchasedItems.push(
          getItemWithStoreSpecificValues(item, storeSpecificValues),
        );
      }
    }
    return previoulsyPurchasedItems.sort(
      getSorter(
        previouslyPurchasedList.sortOrderValue?.sortBy,
        currentStoreName,
        previouslyPurchasedList.sortOrderValue?.sortOrder,
      ),
    );
  },
);

export const previouslyPurchasedListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.PreviouslyPurchased];

export const priceOfItemsSelector = (listname: ListName) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name][listname],
      (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
      (state: RootState) => state[listsSlice.name].currentStoreName,
    ],
    (list, storeSpecificValuesMap, currentStoreName) => {
      let totalPrice = 0;
      for (const value of Object.values(storeSpecificValuesMap)) {
        if (value?.[StoreSpecificValueKey.IsInCart]?.[currentStoreName]) {
          const quantity =
            value?.[StoreSpecificValueKey.Quantity]?.[currentStoreName] || 0;
          const price =
            value?.[StoreSpecificValueKey.Price]?.[currentStoreName] || 0;
          const itemPrice = quantity * price;
          totalPrice += itemPrice;
        }
      }
      return totalPrice;
    },
  );

export const selectedItemsFromInCartSelector = (state: RootState) =>
  state[listsSlice.name].selectedItemsFromInCart;

export const selectedItemsFromPreviouslyPurchasedSelector = (
  state: RootState,
) => state[listsSlice.name].selectedItemsFromPreviouslyPurchased;

export const selectedItemsFromShoppingCartSelector = (state: RootState) =>
  state[listsSlice.name].selectedItemsFromShoppingCart;

/**
 *The way this is written, the shopping list will update when the storeList changes when really it should only change when the current store changes
 *This may not be an issue though
 **/
export const storeSpecificListSelector = (listname: ListName) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name][ListName.ShoppingList],
      (state: RootState) => state[listsSlice.name][ListName.InCartList],
      (state: RootState) => state[listsSlice.name][ListName.ItemsList],
      (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
      (state: RootState) => state[listsSlice.name].storesList.data,
      (state: RootState) => state[listsSlice.name].currentStoreName,
    ],
    (
      shoppingList,
      inCartList,
      itemsList,
      storeSpecificValuesMap,
      storesList,
      currentStoreName,
    ) => {
      const currentStore = storesList.find(
        (store) => store.name === currentStoreName,
      );
      if (!currentStore?.name) return [];

      const listToDisplay = [] as ItemWithStoreSpecificValues[];
      for (const [key, values] of Object.entries(storeSpecificValuesMap)) {
        const isInCartForCurrentStore =
          values?.[StoreSpecificValueKey.IsInCart]?.[currentStore.name];

        if (
          (listname === ListName.ShoppingList && isInCartForCurrentStore) ||
          (listname === ListName.InCartList && !isInCartForCurrentStore)
        )
          continue;

        const currentQuantityForItemAndStoreCombination =
          values?.[StoreSpecificValueKey.Quantity]?.[currentStore.name];

        if (
          currentQuantityForItemAndStoreCombination &&
          currentQuantityForItemAndStoreCombination > 0
        ) {
          const currentItem = getItemFromList(itemsList.data, key);
          if (!currentItem) continue;
          listToDisplay.push({
            ...currentItem,
            ...values,
          } as ItemWithStoreSpecificValues);
        }
      }

      const filteredList = getFilteredList<ItemWithStoreSpecificValues>(
        listToDisplay,
        listname === ListName.ShoppingList
          ? shoppingList.filters
          : inCartList.filters,
      );
      filteredList.sort(
        getSorter(
          listname === ListName.ShoppingList
            ? shoppingList.sortOrderValue.sortBy
            : inCartList.sortOrderValue.sortBy,
          currentStoreName,
          listname === ListName.ShoppingList
            ? shoppingList.sortOrderValue.sortOrder
            : inCartList.sortOrderValue.sortOrder,
        ),
      );
      return filteredList;
    },
  );

export const shoppingListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.ShoppingList];

export const storesListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.StoresList];

export const storesListItemSelector = (storeName: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].storesList.data],
    (storesList) => {
      return storesList?.find((store) => store.name === storeName) as Store;
    },
  );

export const storeSpecificValuesMapSelector = (state: RootState) =>
  state[listsSlice.name].storeSpecificValuesMap;

export const storeSpecificValuesSelector = (
  key: Key,
  fieldName: StoreSpecificValueKey,
) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
      (state: RootState) => state[listsSlice.name].currentStoreName,
    ],
    (storeSpecificValuesMap, currentStoreName) => {
      return storeSpecificValuesMap?.[getKeyToUse(key)]?.[fieldName]?.[
        currentStoreName
      ];
    },
  );

// Action creators are generated for each case reducer function
export const {
  addAllToShoppingCart,
  addItemsListItem,
  addItemToCart,
  addStoresListItem,
  clearShopping,
  completePurchase,
  migrateItems,
  moveAllToInCart,
  moveItemToShoppingList,
  moveSelectedToCart,
  moveSelectedPreviouslyPurchasedItemsToShopping,
  moveSelectedToShopping,
  removeItemsListItems,
  removeStoresListItem,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetItemsList,
  resetLastPurchasedMap,
  resetListSlice,
  resetListToDisplay,
  resetListToDisplayFilters,
  resetStoresList,
  setCurrentLocation,
  setCurrentStoreName,
  setFilters,
  setItemsList,
  setSortOrder,
  setStoresList,
  setStoreSpecificValues,
  setIsMultiSelectModeForInCartCart,
  setIsMultiSelectModeForPreviouslyPurchased,
  setIsMultiSelectModeForShoppingCart,
  toggleSortOrder,
  updateSelectedItemsFromInCart,
  updateSelectedItemsFromPreviouslyPurchased,
  updateSelectedItemsFromShoppingCart,
  updateStoreSpecificValues,
} = listsSlice.actions;

export default listsSlice.reducer;

function moveItems(
  state: ListsState,
  keys: string[],
  isInCart = true,
  shouldAddQuantity = false,
) {
  const { currentStoreName, storeSpecificValuesMap } = state;

  for (const key of keys) {
    if (shouldAddQuantity) {
      if (
        !(storeSpecificValuesMap[key] as any)?.[StoreSpecificValueKey.Quantity]
      ) {
        (storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.Quantity] =
          {};
      }
      (storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.Quantity] = {
        [currentStoreName]: 1,
      };
    }
    if (
      storeSpecificValuesMap[key]?.[StoreSpecificValueKey.Quantity]?.[
        currentStoreName
      ]
    ) {
      (storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.IsInCart] = {
        ...(storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.IsInCart],
        [currentStoreName]: isInCart,
      };
    }
  }
}

function updateSelectedItems(
  state: ListsState,
  action: PayloadAction<
    UpdateSelectedItemsPayload<ItemWithStoreSpecificValues>
  >,
  listName: ListName.ShoppingList | ListName.InCartList | 'previouslyPurchased',
) {
  const { operation: opearation, item } = action.payload;
  if (!item || !opearation) return;
  const keyToUse = getKeyToUse(item);
  if (!keyToUse) {
    displayAlert({ error: 'No key found', item, keyToUse });
  }

  switch (opearation) {
    case 'add':
      switch (listName) {
        case ListName.InCartList:
          state.selectedItemsFromInCart = [
            ...state.selectedItemsFromInCart,
            item,
          ];
          break;
        case ListName.ShoppingList:
          state.selectedItemsFromShoppingCart = [
            ...state.selectedItemsFromShoppingCart,
            item,
          ];
          break;
        case 'previouslyPurchased':
          state.selectedItemsFromPreviouslyPurchased = [
            ...state.selectedItemsFromPreviouslyPurchased,
            item,
          ];
          break;
        default:
          throw new Error('No listname given in updateSelectedItems');
      }
      break;
    case 'remove':
      switch (listName) {
        case ListName.InCartList:
          state.selectedItemsFromInCart = state.selectedItemsFromInCart.filter(
            (item) => getKeyToUse(item) !== keyToUse,
          );
          break;
        case ListName.ShoppingList:
          state.selectedItemsFromShoppingCart =
            state.selectedItemsFromShoppingCart.filter(
              (item) => getKeyToUse(item) !== keyToUse,
            );
          break;
        case 'previouslyPurchased':
          state.selectedItemsFromPreviouslyPurchased =
            state.selectedItemsFromPreviouslyPurchased.filter(
              (item) => getKeyToUse(item) !== keyToUse,
            );
          break;
      }
      break;
    case 'set':
    default:
      switch (listName) {
        case ListName.InCartList:
          state.selectedItemsFromInCart = item ? [item] : [];
          break;
        case ListName.ShoppingList:
          state.selectedItemsFromShoppingCart = item ? [item] : [];
          break;
        case 'previouslyPurchased':
          state.selectedItemsFromPreviouslyPurchased = item ? [item] : [];
          break;
      }
      break;
  }
}

function updateStoreSpecificValueMap(
  state: ListsState,
  key: Key,
  storeSpecificValuesToUpdate: StoreSpecificValueUpdater,
) {
  const keyToUse = getKeyToUse(key);
  for (const [valueName, value] of Object.entries(
    storeSpecificValuesToUpdate || {},
  )) {
    const currentItem = state.storeSpecificValuesMap?.[keyToUse] as any;
    const currentValue = currentItem?.[valueName]?.[state.currentStoreName];
    const newValue = (value as any)?.(currentValue);

    if (!currentItem || !currentValue) {
      state.storeSpecificValuesMap[keyToUse] = {
        ...state.storeSpecificValuesMap[keyToUse],
        [valueName]: {
          [state.currentStoreName]: newValue,
        },
      } as StoreSpecificValues;
    } else {
      currentItem[valueName][state.currentStoreName] = newValue;
    }
  }
}
