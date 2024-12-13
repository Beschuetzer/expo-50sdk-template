import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import { updateStoreSpecificValueMap } from './helpers/updateStoreSpecificValueMap';
import { RootState } from '../store';

import { getSorter, SortOrder } from '@/components/lists/sorters';
import { EMPTY_STRING } from '@/constants/general';
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
import { LoadAllResponse } from '@/types/bffService';
import { CurrentLocation, OriginalKeyProp, State } from '@/types/general';
import {
  ListName,
  AddAllToShoppingCartPayload,
  AddItemsListItemPayload,
  AddStoresListItemPayload,
  CompletePurchasePayload,
  HandleSaveAllResponsePayload,
  ResetListToDisplayPayload,
  ResetListToDisplayFiltersPayload,
  SetFiltersPayload,
  SetSortOrderPayload,
  ToggleSortOrderPayload,
  UpdateSelectedItemsPayload,
  UpdateStoreSpecificValuesPayload,
} from '@/types/listSlice';
import { getItemWithStoreSpecificValues } from '@/utils/getItemWithStoreSpecificValues';
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

//#region State
const CURRENT_LOCATION_INITIAL = null;
const CURRENT_LOCATION_STATE_INITIAL = State.None;
const IS_MULTI_SELECT_MODE_FOR_SHOPPING_CART_INITIAL = false;

/**
 * {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
 * {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
 * {@link ListsState.shoppingList shoppingList} is the items currently being bought
 * {@link ListsState.stores stores} is a list of the stores created
 **/
export type ListsState = {
  currentLocation: CurrentLocation;
  currentLocationState: State;
  currentStoreId: string;
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
  currentLocationState: CURRENT_LOCATION_STATE_INITIAL,
  currentStoreId: EMPTY_STRING,
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

      (state.storeSpecificValuesMap[keyToUse] as any)[
        StoreSpecificValueKey.IsInCart
      ][state.currentStoreId] = true;
    },
    addItemsListItem: (
      state: ListsState,
      action: PayloadAction<AddItemsListItemPayload>,
    ) => {
      const { item, storeSpecificValues } = action.payload || {};
      const { currentStoreId } = state;
      const keyToUse = getKeyToUse(item);

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
        item,
      });

      //add store specific values if they exist
      if (storeSpecificValues && currentStoreId) {
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
    },
    addStoresListItem: (
      state: ListsState,
      action: PayloadAction<AddStoresListItemPayload>,
    ) => {
      const { newStore } = action.payload;

      updateListWithItem({
        state,
        listName: ListName.StoresList,
        item: getStoreWithDistance(newStore, state.currentLocation),
      });

      if (state.storesList.data.length === 1) {
        state.currentStoreId = getKeyToUse(newStore);
      }
    },
    clearShopping: (state: ListsState) => {
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap: state.storeSpecificValuesMap,
        onNewItemStart: (input) => {
          const { storeSpecificValues } = input;
          if (
            storeSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[
              state.currentStoreId
            ]
          ) {
            storeSpecificValues[StoreSpecificValueKey.IsInCart][
              state.currentStoreId
            ] = false;
          }
          if (
            storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[
              state.currentStoreId
            ]
          ) {
            storeSpecificValues[StoreSpecificValueKey.Quantity][
              state.currentStoreId
            ] = 0;
          }
        },
      });
    },
    completePurchase: (
      state: ListsState,
      action: PayloadAction<CompletePurchasePayload>,
    ) => {
      const { currentStoreId, storeSpecificValuesMap } = state;
      const lastPurchasedMap = action.payload || {};
      const now = Date.now();

      for (const key of Object.keys(storeSpecificValuesMap)) {
        if (
          storeSpecificValuesMap[key]?.[StoreSpecificValueKey.IsInCart]?.[
            currentStoreId
          ]
        ) {
          const savedValue = lastPurchasedMap?.[key]?.[state.currentStoreId];

          state.lastPurchasedMap[key] = {
            ...state.lastPurchasedMap[key],
            [state.currentStoreId]: savedValue || now,
          };

          (storeSpecificValuesMap[key] as any) = {
            ...(storeSpecificValuesMap[key] as any),
            [StoreSpecificValueKey.IsInCart]: {
              ...(storeSpecificValuesMap[key] as any)[
                StoreSpecificValueKey.IsInCart
              ],
              [currentStoreId]: false,
            },
            [StoreSpecificValueKey.Quantity]: {
              ...(storeSpecificValuesMap[key] as any)[
                StoreSpecificValueKey.Quantity
              ],
              [currentStoreId]: 0,
            },
          };
        }
      }
    },
    handleLoadAllResponse: (
      state: ListsState,
      action: PayloadAction<LoadAllResponse>,
    ) => {
      if (!action.payload) return;
      const { items, lastPurchasedMap, storeSpecificValues, stores, settings } =
        action.payload;
      if (lastPurchasedMap) {
        state.lastPurchasedMap = lastPurchasedMap;
      }
      if (items && items.length > 0) {
        state[ListName.ItemsList].data = items;
      }
      if (stores && stores.length > 0) {
        state[ListName.StoresList].data = stores;
      }
      if (storeSpecificValues) {
        state.storeSpecificValuesMap = storeSpecificValues;
      }
      if (settings) {
        state[ListName.ItemsList].sortOrderValue =
          settings.sortOrderValues.items;
        state[ListName.StoresList].sortOrderValue =
          settings.sortOrderValues.stores;

        const isCurrentStorePresent = stores?.find(
          (store) => store._id === settings.currentStoreId,
        );
        if (isCurrentStorePresent) {
          state.currentStoreId = settings.currentStoreId;
        }
      }
      for (const item of state[ListName.ItemsList]?.data) {
        item.needsSaving = false;
        item.hasBeenSaved = true;
      }
      for (const store of state[ListName.StoresList]?.data) {
        store.needsSaving = false;
        store.hasBeenSaved = true;
      }
    },
    handleSaveAllResponse: (
      state: ListsState,
      action: PayloadAction<HandleSaveAllResponsePayload>,
    ) => {
      const { payload } = action;
      if (!payload) {
        throw new Error('No payload found in handleSaveAllResponse');
      }
      const {
        itemsResult,
        storesResult,
        storeSpecificValuesResult,
        itemsSaved,
        storesSaved,
      } = payload || {};

      //set all items to false for needsSaving if the itemResult is successful
      if (
        itemsResult?.result?.ok ||
        (itemsResult?.insertedCount +
          itemsResult?.upsertedCount +
          itemsResult.modifiedCount || -1) >= itemsSaved.length
      ) {
        for (const item of state[ListName.ItemsList]?.data) {
          item.needsSaving = false;
          item.hasBeenSaved = true;
        }
      }

      //set all stores to false for needsSaving if the storeResult is successful
      if (
        storesResult?.result?.ok ||
        (storesResult?.insertedCount +
          storesResult?.upsertedCount +
          storesResult.modifiedCount || -1) >= storesSaved.length
      ) {
        for (const store of state[ListName.StoresList]?.data) {
          store.needsSaving = false;
          store.hasBeenSaved = true;
        }
      }

      // check that the storeSpecificValuesResult contains the expected values
      // if not, set needsSaving to true for that item
      if (storeSpecificValuesResult?.values) {
        for (const item of itemsSaved) {
          const key = getKeyToUse(item);
          const valuesInMap = storeSpecificValuesResult.values[key];
          const stateValuesMap = state.storeSpecificValuesMap[key];
          const areValuesTheSame = _.isEqual(valuesInMap, stateValuesMap);
          if (!areValuesTheSame) {
            const item = getItemFromList(state[ListName.ItemsList].data, key);
            if (item) {
              item.needsSaving = true;
            }
          }
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
      ][state.currentStoreId] = false;
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
    removeStoresListItems: (
      state: ListsState,
      action: PayloadAction<Store[]>,
    ) => {
      const keysToUse = action.payload.map((key) => getKeyToUse(key));
      if (!keysToUse || keysToUse.length <= 0) {
        alert(
          'At least one key must be provided in order to remove an item from the storesList.',
        );
        return;
      }
      removeItems<Store>(state, action.payload, ListName.StoresList);
    },
    resetCurrentLocation: (state: ListsState) => {
      state.currentLocation = CURRENT_LOCATION_INITIAL;
      for (const store of state.storesList.data) {
        store.calculatedDistance = -1;
      }
    },
    resetCurrentLocationState: (state: ListsState) => {
      state.currentLocationState = CURRENT_LOCATION_STATE_INITIAL;
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
      state.currentStoreId = EMPTY_STRING;
    },
    resetCurrentStoreId: (state: ListsState) => {
      state.currentStoreId = EMPTY_STRING;
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
    setCurrentLocationState: (
      state: ListsState,
      action: PayloadAction<State>,
    ) => {
      if (!action.payload) return;
      state.currentLocationState = action.payload;
    },
    setCurrentStoreId: (
      state: ListsState,
      action: PayloadAction<string | undefined>,
    ) => {
      if (!action.payload) return;
      state.currentStoreId = action.payload;
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
        getSorter(newSortBy, state.currentStoreId, newSortOrder),
      );

      state[listName].sortOrderValue = {
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      };
    },
    setStoresList: (
      state: ListsState,
      action: PayloadAction<
        ListsState['storesList'] & { currentStoreId?: string }
      >,
    ) => {
      if (!action.payload) return;
      const { currentStoreId } = action.payload;
      delete action.payload.currentStoreId;

      state.currentStoreId = currentStoreId || EMPTY_STRING;
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
      const { storeSpecificValuesToUpdate, key, storeId } = action.payload;
      const keyToUse = getKeyToUse(key);
      if (!keyToUse || !storeSpecificValuesToUpdate) {
        alert(
          `A key, storeName, and storeSpecificValuesToUpdate must be provided in order to update an item.`,
        );
        return;
      }

      updateStoreSpecificValueMap(
        state,
        key,
        storeSpecificValuesToUpdate,
        storeId,
      );
    },
  },
});

export const currentLocationSelector = (state: RootState) =>
  state[listsSlice.name].currentLocation;

export const currentLocationStateSelector = (state: RootState) =>
  state[listsSlice.name].currentLocationState;

export const currentStoreSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].storesList.data,
    (state: RootState) => state[listsSlice.name].currentStoreId,
  ],
  (storesList, currentStoreId) => {
    return getCurrentStore(storesList, currentStoreId);
  },
);

export const currentStoreIdSelector = (state: RootState) =>
  state[listsSlice.name].currentStoreId;

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
      (state: RootState) => state[listsSlice.name].currentStoreId,
    ],
    (lastPurchasedMap, currentStoreId) => {
      return lastPurchasedMap?.[getKeyToUse(key)]?.[currentStoreId];
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
        getSorter(
          sortOrderValue.sortBy,
          EMPTY_STRING,
          sortOrderValue.sortOrder,
        ),
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
    (state: RootState) => state[listsSlice.name].currentStoreId,
  ],
  (
    itemsList,
    previouslyPurchasedList,
    storeSpecificValuesMap,
    lastPurchasedMap,
    currentStoreId,
  ) => {
    const previoulsyPurchasedItems: PrevioulsyPurchasedItem[] = [];
    for (const item of itemsList.data) {
      const key = getKeyToUse(item);
      const lastPurchaseDate = lastPurchasedMap?.[key]?.[currentStoreId];
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
        currentStoreId,
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
      (state: RootState) => state[listsSlice.name].currentStoreId,
    ],
    (list, storeSpecificValuesMap, currentStoreId) => {
      let totalPrice = 0;
      for (const value of Object.values(storeSpecificValuesMap)) {
        const isInCart =
          value?.[StoreSpecificValueKey.IsInCart]?.[currentStoreId];
        const shouldAddToTotal =
          (isInCart && listname === ListName.InCartList) ||
          (!isInCart && listname === ListName.ShoppingList);

        if (shouldAddToTotal) {
          const quantity =
            value?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] || 0;
          const price =
            value?.[StoreSpecificValueKey.Price]?.[currentStoreId] || 0;
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
      (state: RootState) => state[listsSlice.name].currentStoreId,
    ],
    (
      shoppingList,
      inCartList,
      itemsList,
      storeSpecificValuesMap,
      storesList,
      currentStoreId,
    ) => {
      const currentStore = getCurrentStore(storesList, currentStoreId);
      if (!currentStore?.name) return [];

      const listToDisplay = [] as ItemWithStoreSpecificValues[];

      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap,
        onNewItemStart: (input) => {
          const { itemKey, storeSpecificValues } = input;
          const isInCartForCurrentStore =
            storeSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[
              currentStoreId
            ];

          if (
            (listname === ListName.ShoppingList && isInCartForCurrentStore) ||
            (listname === ListName.InCartList && !isInCartForCurrentStore)
          )
            return;

          const currentQuantityForItemAndStoreCombination =
            storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[
              currentStoreId
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
          currentStoreId,
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

export const storeSpecificValuesMapSelector = (state: RootState) =>
  state[listsSlice.name].storeSpecificValuesMap;

export const storeSpecificValuesSelector = (
  key: Key,
  fieldName: StoreSpecificValueKey,
) =>
  createSelector(
    [
      (state: RootState) => state[listsSlice.name].storeSpecificValuesMap,
      (state: RootState) => state[listsSlice.name].currentStoreId,
    ],
    (storeSpecificValuesMap, currentStoreId) => {
      return storeSpecificValuesMap?.[getKeyToUse(key)]?.[fieldName]?.[
        currentStoreId
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
  handleLoadAllResponse,
  handleSaveAllResponse,
  moveAllToInCart,
  moveItemToShoppingList,
  moveSelectedToCart,
  moveSelectedPreviouslyPurchasedItemsToShopping,
  moveSelectedToShopping,
  removeItemsListItems,
  removeShoppingListItems,
  removeStoresListItems,
  resetCurrentLocation,
  resetCurrentLocationState,
  resetCurrentStoreId,
  resetItemsList,
  resetLastPurchasedMap,
  resetListSlice,
  resetListToDisplay,
  resetListToDisplayFilters,
  resetSelectedItemsInShopping,
  resetStoresList,
  setCurrentLocation,
  setCurrentLocationState,
  setCurrentStoreId,
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
  item: T;
  onKeyChange?: (input: OnKeyChangeInput) => void;
} & Partial<OriginalKeyProp>;

function moveItems(
  state: ListsState,
  keys: string[],
  isInCart = true,
  shouldAddQuantity = false,
) {
  const { currentStoreId, storeSpecificValuesMap } = state;

  for (const key of keys) {
    if (shouldAddQuantity) {
      if (
        !(storeSpecificValuesMap[key] as any)?.[StoreSpecificValueKey.Quantity]
      ) {
        (storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.Quantity] =
          {};
      }
      (storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.Quantity] = {
        [currentStoreId]: 1,
      };
    }
    if (
      storeSpecificValuesMap[key]?.[StoreSpecificValueKey.Quantity]?.[
        currentStoreId
      ]
    ) {
      (storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.IsInCart] = {
        ...(storeSpecificValuesMap[key] as any)[StoreSpecificValueKey.IsInCart],
        [currentStoreId]: isInCart,
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
  const { listName, item, state, originalKey, onKeyChange } = props;
  const itemKeyToUse = getKeyToUse(item);
  const originalKeyToUse = getKeyToUse(originalKey || EMPTY_STRING);
  const newKeyToUse = getKeyToUse(item);

  if (!itemKeyToUse) {
    alert(
      `Unable to add an item with key of '${itemKeyToUse}' to the '${listName}'.`,
    );
    return;
  }

  const itemIndex = state[listName].data.findIndex((item: Key) => {
    const keyLocal = getKeyToUse(item);
    return keyLocal === itemKeyToUse;
  });

  if (itemIndex > -1) {
    state[listName].data[itemIndex] = item as any;
  } else {
    state[listName].data.push(item as any);
  }

  if (originalKeyToUse && newKeyToUse !== originalKeyToUse) {
    const canDoSimpleUpdate = itemIndex === -1;
    onKeyChange &&
      onKeyChange({
        type: canDoSimpleUpdate
          ? OnKeyChangeType.Changing
          : OnKeyChangeType.Merging,
        newKey: newKeyToUse,
        oldKey: originalKeyToUse,
      });
  }
}

function updateSelectedItems(
  state: ListsState,
  action: PayloadAction<
    UpdateSelectedItemsPayload<ItemWithStoreSpecificValues>
  >,
  listName: ListName.ShoppingList | ListName.InCartList | 'previouslyPurchased',
) {
  const { operation, item } = action.payload;
  if (!item || !operation) return;
  const keyToUse = getKeyToUse(item);
  if (!keyToUse) {
    displayAlert({ error: 'No key found', item, keyToUse });
  }

  switch (operation) {
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
  itemsToRemove: T[],
  listName: ListName,
  onRemoveItem?: (keyBeingRemoved: T) => void,
) {
  if (!itemsToRemove || itemsToRemove.length === 0) return;
  const keysToUse = itemsToRemove.map((item) => getKeyToUse(item));
  state[listName].data = state[listName].data.filter((item: Key) => {
    if (item?._id) {
      return !keysToUse.includes(item._id);
    } else if (item?.upc && item.name) {
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

function getCurrentStore(
  storesList: StoreList['data'],
  currentStoreId: ListsState['currentStoreId'],
) {
  const foundStore = (storesList.find((store) => {
    return getKeyToUse(store) === currentStoreId;
  }) || {
    _id: EMPTY_STRING,
    name: EMPTY_STRING,
    gpsCoordinates: null,
  }) as Store;
  return foundStore;
}

//todo?
// function mergeStore() {
// const { newKey, oldKey } = input;

// //handle storeSpecificValuesMap merging
// iterateStoreSpecificValuesMap({
//   storeSpecificValuesMap: state.storeSpecificValuesMap,
//   onNewStoreSpecificValue(input) {
//     const {
//       itemKey,
//       storeSpecificValueKeyValue,
//       storeSpecificValueKey,
//     } = input;
//     const oldKeyValue = storeSpecificValueKeyValue?.[oldKey];
//     const newKeyValue = storeSpecificValueKeyValue?.[newKey];
//     if (storeSpecificValueKeyValue && oldKeyValue !== undefined) {
//       if (storeSpecificValueKey === 'quantity') {
//         console.log({
//           case: '1',
//           storeSpecificValueKeyValue,
//           oldKeyValue,
//           newKeyValue,
//           currentStore: state.currentStoreId,
//           storeSpecificValueKey,
//           itemKey,
//         });
//       }
//       if (typeof oldKeyValue === 'object') {
//         storeSpecificValueKeyValue[newKey] = {
//           ...(newKeyValue as unknown as object),
//           ...(oldKeyValue as unknown as object),
//         } as any;
//       } else {
//         storeSpecificValueKeyValue[newKey] =
//           newKeyValue || oldKeyValue;
//       }
//     }
//     delete storeSpecificValueKeyValue?.[oldKey];
//   },
// });

// //handle lastPurchasedMap merging (uses the most recent value between the two stores)
// for (const [, storeSpecificValue] of Object.entries(
//   state.lastPurchasedMap || {},
// )) {
//   const oldKeyValue = storeSpecificValue?.[oldKey];
//   const newKeyValue = storeSpecificValue?.[newKey];
//   if (storeSpecificValue && oldKeyValue !== undefined) {
//     storeSpecificValue[newKey] = Math.max(
//       newKeyValue || EMPTY_NUMBER,
//       oldKeyValue || EMPTY_NUMBER,
//     );
//   }
//   delete storeSpecificValue?.[oldKey];
// }
// state.currentStoreId = newKey;
// }

//#endregion
