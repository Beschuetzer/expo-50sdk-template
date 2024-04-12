import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { updateStoreSpecificValueMap } from './helpers/updateStoreSpecificValueMap';
import { RootState } from '../store';

import { ListFilterFilters } from '@/components/lists/ListFilter';
import { SortOrder, SortType, getSorter } from '@/components/lists/sorters';
import { EMPTY_NUMBER, EMPTY_STRING } from '@/constants/general';
import {
  Item,
  ItemWithStoreSpecificValues,
  ItemsList,
  Key,
  LastPurchasedList,
  LastPurchasedMap,
  PrevioulsyPurchasedItem,
  ShoppingList,
  StoreList,
  StoreSpecificValue,
  StoreSpecificValueKey,
  StoreSpecificValueUpdater,
  StoreSpecificValues,
  StoreSpecificValuesMap,
} from '@/types/Item';
import { GpsCoordinate, Store } from '@/types/Store';
import { ListNameProp, OriginalKeyProp } from '@/types/general';
import {
  calculateDistance,
  deleteImages,
  displayAlert,
  getEmptyArray,
  getEmptyList,
  getEmptyObject,
  getFilteredList,
  getIsPreviouslyPurchasedItemRecommended,
  getItemFromList,
  getKeyToUse,
  getStoreWithDistance,
} from '@/utils/helpers';
import { iterateStoreSpecificValuesMap } from '@/utils/iterateStoreSpecificValuesMap';
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
} & OriginalKeyProp;

export type AddStoresListItemPayload = {
  newStore: Store;
} & OriginalKeyProp;

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
  [ListName.PreviouslyPurchased]: LastPurchasedList;
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
      const keyToUse = getKeyToUse(item);
      const originalKeyToUse = getKeyToUse(originalKey || EMPTY_STRING);

      if (item.images) {
        let indexOffset = 0;
        item.images = item.images.filter((imageLocal, index) => {
          const isValid = !!imageLocal;
          if (!isValid && index <= item?.imageToUseIndex) indexOffset++;
          return isValid;
        });

        if (item.imageToUseIndex) {
          item.imageToUseIndex -= indexOffset;
        }
      }

      updateListWithItem({
        state,
        listName: ListName.ItemsList,
        newItem: item,
        originalKey,
      });

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
      if (originalKeyToUse && originalKeyToUse !== keyToUse) {
        delete state.storeSpecificValuesMap[originalKeyToUse];
      }
    },
    addStoresListItem: (
      state: ListsState,
      action: PayloadAction<AddStoresListItemPayload>,
    ) => {
      const { newStore, originalKey } = action.payload;

      updateListWithItem({
        state,
        listName: ListName.StoresList,
        newItem: getStoreWithDistance(newStore, state.currentLocation),
        originalKey,
        onKeyChange: (input) => {
          const { newKey, oldKey } = input;

          // console.log(input);
          // displayAlert(input);
          // console.log(''.padEnd(200, '-'));
          // const start = performance.now();

          //handle storeSpecificValuesMap merging
          iterateStoreSpecificValuesMap({
            storeSpecificValuesMap: state.storeSpecificValuesMap,
            onNewStoreSpecificValue(input) {
              const {
                itemKey,
                storeSpecificValueKeyValue,
                storeSpecificValueKey,
              } = input;
              const oldKeyValue = storeSpecificValueKeyValue?.[oldKey];
              const newKeyValue = storeSpecificValueKeyValue?.[newKey];
              if (storeSpecificValueKeyValue && oldKeyValue !== undefined) {
                if (storeSpecificValueKey === 'quantity') {
                  console.log({
                    case: '1',
                    storeSpecificValueKeyValue,
                    oldKeyValue,
                    newKeyValue,
                    currentStore: state.currentStoreName,
                    storeSpecificValueKey,
                    itemKey,
                  });
                }
                if (typeof oldKeyValue === 'object') {
                  storeSpecificValueKeyValue[newKey] = {
                    ...(newKeyValue as unknown as object),
                    ...(oldKeyValue as unknown as object),
                  } as any;
                } else {
                  storeSpecificValueKeyValue[newKey] =
                    newKeyValue || oldKeyValue;
                }
              }
              delete storeSpecificValueKeyValue?.[oldKey];
            },
          });

          //handle lastPurchasedMap merging (uses the most recent value between the two stores)
          for (const [, storeSpecificValue] of Object.entries(
            state.lastPurchasedMap || {},
          )) {
            const oldKeyValue = storeSpecificValue?.[oldKey];
            const newKeyValue = storeSpecificValue?.[newKey];
            if (storeSpecificValue && oldKeyValue !== undefined) {
              storeSpecificValue[newKey] = Math.max(
                newKeyValue || EMPTY_NUMBER,
                oldKeyValue || EMPTY_NUMBER,
              );
            }
            delete storeSpecificValue?.[oldKey];
          }

          // const end = performance.now();
          // console.log({ timeToRun: end - start });
          // console.log('done with work'.padEnd(200, '-'));

          // //validating storeSpecificValuesMap
          // for (const [key, storeSpecificValues] of Object.entries(
          //   state.storeSpecificValuesMap || {},
          // )) {
          //   // console.log({
          //   //   key,
          //   //   storeSpecificValuesAfter: storeSpecificValues,
          //   // });
          //   for (const [storeSpecificValueKey, value] of Object.entries(
          //     storeSpecificValues || {},
          //   )) {
          //     if (storeSpecificValueKey === 'quantity') {
          //       console.log({ key, storeSpecificValueKey, value });
          //     }
          //   }
          // }

          // //validating lastPurcahsedMap
          // for (const [key, storeSpecificValue] of Object.entries(
          //   state.lastPurchasedMap || {},
          // )) {
          //   console.log({ storeSpecificValue });
          // }

          // console.log('done with print out'.padEnd(200, '-'));

          state.currentStoreName = newKey;
        },
      });

      if (state.storesList.data.length === 1) {
        state.currentStoreName = newStore.name;
      }
    },
    clearShopping: (state: ListsState) => {
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap: state.storeSpecificValuesMap,
        onNewItemStart: (input) => {
          const { storeSpecificValues } = input;
          if (
            storeSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[
              state.currentStoreName
            ]
          ) {
            storeSpecificValues[StoreSpecificValueKey.IsInCart][
              state.currentStoreName
            ] = false;
          }
          if (
            storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[
              state.currentStoreName
            ]
          ) {
            storeSpecificValues[StoreSpecificValueKey.Quantity][
              state.currentStoreName
            ] = 0;
          }
        },
      });
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
      removeItems<Item>(
        state,
        action.payload,
        ListName.ItemsList,
        (itemBeingRemoved) => {
          deleteImages(itemBeingRemoved.images);
        },
      );
    },
    removeShoppingListItems: (
      state: ListsState,
      action: PayloadAction<Item[]>,
    ) => {
      removeItems<ItemWithStoreSpecificValues>(
        state,
        action.payload,
        ListName.ShoppingList,
      );
      state.isMultiSelectModeForShoppingCart = false;
      state.selectedItemsFromShoppingCart = [];
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

      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap: state.storeSpecificValuesMap,
        onNewStoreSpecificValue: (input) => {
          const { storeSpecificValueKeyValue } = input;
          if (storeSpecificValueKeyValue?.[keyToUse] !== undefined) {
            delete storeSpecificValueKeyValue[keyToUse];
          }
        },
      });
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

      switch (listName) {
        case ListName.InCartList:
          state.isMultiSelectModeForInCart = false;
          state.selectedItemsFromInCart = [];
          break;
        case ListName.ShoppingList:
          state.isMultiSelectModeForShoppingCart = false;
          state.selectedItemsFromShoppingCart = [];
          break;
        case ListName.PreviouslyPurchased:
          state.isMultiSelectModeForPreviouslyPurchased = false;
          state.selectedItemsFromPreviouslyPurchased = [];
          break;
        default:
          break;
      }
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
      state.lastPurchasedMap = {};
    },
    resetListSlice: (state: ListsState) => {
      state = initialState;
    },
    resetLastPurchasedMap: (state: ListsState) => {
      state.lastPurchasedMap = getEmptyObject();
    },
    resetSelectedItemsInShopping: (state: ListsState) => {
      state.selectedItemsFromInCart = [];
      state.selectedItemsFromPreviouslyPurchased = [];
      state.selectedItemsFromShoppingCart = [];
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
    setLastPurchasedMap: (
      state: ListsState,
      action: PayloadAction<ListsState['lastPurchasedMap']>,
    ) => {
      if (!action.payload) return;
      state.lastPurchasedMap = action.payload;
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
      action: PayloadAction<
        ListsState['storesList'] & { currentStoreName?: string }
      >,
    ) => {
      if (!action.payload) return;
      const { currentStoreName } = action.payload;
      delete action.payload.currentStoreName;

      state.currentStoreName = currentStoreName || EMPTY_STRING;
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
    const previoulsyPurchasedItems: PrevioulsyPurchasedItem[] = [];
    for (const item of itemsList.data) {
      const key = getKeyToUse(item);
      const lastPurchaseDate = lastPurchasedMap?.[key]?.[currentStoreName];
      if (lastPurchaseDate) {
        const storeSpecificValues = storeSpecificValuesMap[key];
        previoulsyPurchasedItems.push({
          ...getItemWithStoreSpecificValues(item, storeSpecificValues),
          isRecommended: getIsPreviouslyPurchasedItemRecommended(
            item,
            lastPurchaseDate,
          ),
        });
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

      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap,
        onNewItemStart: (input) => {
          const { itemKey, storeSpecificValues } = input;
          const isInCartForCurrentStore =
            storeSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[
              currentStore.name
            ];

          if (
            (listname === ListName.ShoppingList && isInCartForCurrentStore) ||
            (listname === ListName.InCartList && !isInCartForCurrentStore)
          )
            return;

          const currentQuantityForItemAndStoreCombination =
            storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[
              currentStore.name
            ];

          if (
            currentQuantityForItemAndStoreCombination &&
            currentQuantityForItemAndStoreCombination > 0
          ) {
            const currentItem = getItemFromList(itemsList.data, itemKey);
            if (!currentItem) return;
            listToDisplay.push({
              ...currentItem,
              ...storeSpecificValues,
            } as ItemWithStoreSpecificValues);
          }
        },
      });

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
  removeShoppingListItems,
  removeStoresListItem,
  resetCurrentLocation,
  resetCurrentStoreName,
  resetItemsList,
  resetLastPurchasedMap,
  resetListSlice,
  resetListToDisplay,
  resetListToDisplayFilters,
  resetSelectedItemsInShopping,
  resetStoresList,
  setCurrentLocation,
  setCurrentStoreName,
  setFilters,
  setItemsList,
  setLastPurchasedMap,
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

//#region Helpers
enum OnKeyChangeType {
  Changing = 'Changing',
  Merging = 'Merging',
}

type OnKeyChangeInput = {
  type: OnKeyChangeType;
  newKey: string;
  oldKey: string;
};

type UpdateListWithItemInput<T> = {
  state: ListsState;
  listName: ListName;
  newItem: T;
  originalKey: Key;
  onKeyChange?: (input: OnKeyChangeInput) => void;
};

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

/**
 *Handles the following cases
 * Adding item
 * Updating item
 * Overriding item with existing item
 * Overriding item with new item
 **/
function updateListWithItem<T extends Key>(props: UpdateListWithItemInput<T>) {
  const { listName, newItem, originalKey, state, onKeyChange } = props;
  const newKeyToUse = getKeyToUse(newItem);
  const originalKeyToUse = getKeyToUse(originalKey || EMPTY_STRING);
  const originalItemIndex = state[listName].data.findIndex(
    (item: Key) => getKeyToUse(item) === originalKeyToUse,
  );
  const newItemIndex = state[listName].data.findIndex((item: Key) => {
    const keyLocal = getKeyToUse(item);
    return keyLocal === newKeyToUse;
  });

  if (!newKeyToUse) {
    alert(
      `Unable to add an item with key of '${newKeyToUse}' to the '${listName}'.`,
    );
    return;
  }

  if (originalKeyToUse && newKeyToUse !== originalKeyToUse) {
    const canDoSimpleUpdate = newItemIndex === -1;
    onKeyChange &&
      onKeyChange({
        type: canDoSimpleUpdate
          ? OnKeyChangeType.Changing
          : OnKeyChangeType.Merging,
        newKey: newKeyToUse,
        oldKey: originalKeyToUse,
      });
  }

  // console.log({
  //   newItem,
  //   originalKey,
  //   originalKeyToUse,
  //   keyToUse,
  //   originalItemIndex,
  //   newItemIndex,
  // });
  if (originalItemIndex >= 0) {
    if (originalKeyToUse === newKeyToUse) {
      console.log('updating existing item');
      state[listName].data[originalItemIndex] = newItem as any;
    } else {
      console.log(
        'overriding existing item with existing item or updating item with new key',
      );
      let indexOffset = 0;
      if (newItemIndex >= 0) {
        state[listName].data.splice(newItemIndex, 1);
        if (newItemIndex < originalItemIndex) {
          indexOffset++;
        }
      }
      state[listName].data[
        originalItemIndex > 0
          ? originalItemIndex - indexOffset
          : originalItemIndex
      ] = newItem as any;
    }
  } else if (originalItemIndex === -1 && newItemIndex >= 0) {
    console.log('overring existing item with new item');
    state[listName].data[newItemIndex] = newItem as any;
  } else {
    console.log('adding item');
    state[listName].data.push(newItem as any);
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

function removeItems<T extends Key>(
  state: ListsState,
  itemsToRemove: Item[],
  listName: ListName,
  onRemoveItem?: (keyBeingRemoved: T) => void,
) {
  const keysToUse = itemsToRemove.map((item) => getKeyToUse(item));
  state[listName].data = state[listName].data.filter((item: Key) => {
    if (item?.upc && item.name) {
      const isMatch = !keysToUse.includes(item.upc);
      if (!isMatch) {
        onRemoveItem && onRemoveItem(item as T);
      }
      return isMatch;
    }
    const isMatch = !keysToUse.includes(item?.name || EMPTY_STRING);
    if (!isMatch) {
      onRemoveItem && onRemoveItem(item as T);
    }
    return isMatch;
  }) as any;

  for (const keyToUse of keysToUse) {
    state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues;
  }
}

//#endregion
