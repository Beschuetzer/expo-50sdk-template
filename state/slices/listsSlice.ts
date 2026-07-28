import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import { updateStoreSpecificValueMap } from './helpers/updateStoreSpecificValueMap';
import { RootState } from '../store';

import { getSorter, SortOrder } from '@/components/lists/sorters';
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
import { LoadAllResponse } from '@/types/bffService';
import { CurrentLocation, OriginalKeyProp, State } from '@/types/general';
import {
  Inventory,
  InventoryItemWithItemDetails,
  InventoryLocation,
  InventoryLocationItem,
  MoveInventoryItemExpirationDates,
} from '@/types/inventory';
import {
  InsertInventoryItemPayload,
  InventoryItemSelectorProps,
  InventoryItemSelectorResponse,
  InventorySliceState,
  MoveInventoryItemPayload,
  ProcessItemToLocationMap,
  RemoveInventoryItemPayload,
} from '@/types/inventorySlice';
import {
  ListName,
  AddAllToShoppingCartPayload,
  AddItemsListItemPayload,
  AddStoresListItemPayload,
  AddMutuallyExclusiveGroupPayload,
  AcceptMutuallyExclusiveGroupSidePayload,
  RemoveItemFromMutuallyExclusiveGroupPayload,
  UpdateMutuallyExclusiveGroupPayload,
  CompletePurchasePayload,
  HandleSaveAllResponsePayload,
  MutuallyExclusiveGroup,
  RemoveMutuallyExclusiveGroupPayload,
  ResetListToDisplayPayload,
  ResetListToDisplayFiltersPayload,
  SetFiltersPayload,
  SetSortOrderPayload,
  ToggleSortOrderPayload,
  UpdateSelectedItemsPayload,
  UpdateStoreSpecificValuesPayload,
  MoveItemToAnotherCartPayload,
  CopyStoreSpecificValuesPayload,
} from '@/types/listSlice';
import { getExpirationDatesQuantity } from '@/utils/getExpirationDatesQuantity';
import { getItemWithStoreSpecificValues } from '@/utils/getItemWithStoreSpecificValues';
import { getMostRecentExpirationDates } from '@/utils/getMostRecentExpirationDates';
import { getUpdatedExpirationDates } from '@/utils/getUpdatedExpirationDates';
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
import {
  ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE,
  iterateStoreSpecificValuesMap,
} from '@/utils/iterateStoreSpecificValuesMap';

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
  inventory: InventorySliceState;
  isMultiSelectModeForShoppingCart: boolean;
  isMultiSelectModeForPreviouslyPurchased: boolean;
  isMultiSelectModeForInCart: boolean;
  selectedItemsFromPreviouslyPurchased: ItemWithStoreSpecificValues[];
  selectedItemsFromShoppingCart: ItemWithStoreSpecificValues[];
  selectedItemsFromInCart: ItemWithStoreSpecificValues[];
  storeSpecificValuesMap: StoreSpecificValuesMap;
  mutuallyExclusiveGroups: MutuallyExclusiveGroup[];
};

const initialState: ListsState = {
  currentLocation: CURRENT_LOCATION_INITIAL,
  currentLocationState: CURRENT_LOCATION_STATE_INITIAL,
  currentStoreId: EMPTY_STRING,
  /**
   *inventory was originally a separate slice but I was getting strange redux persistence issues
   *so I moved it into the lists slice.
   **/
  inventory: {
    currentLocationId: EMPTY_STRING,
    items: {},
    locations: [],
    lastDecrementedItemId: EMPTY_STRING,
  },
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
  mutuallyExclusiveGroups: [],
};
//#endregion

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    acceptMutuallyExclusiveGroupSide: (
      state: ListsState,
      action: PayloadAction<AcceptMutuallyExclusiveGroupSidePayload>,
    ) => {
      if (!state.mutuallyExclusiveGroups) {
        state.mutuallyExclusiveGroups = [];
        return;
      }
      const { id, acceptedSide } = action.payload;
      const group = state.mutuallyExclusiveGroups.find((g) => g.id === id);
      if (!group) return;

      state.mutuallyExclusiveGroups = state.mutuallyExclusiveGroups.filter(
        (g) => g.id !== id,
      );

      const storeId = state.currentStoreId;
      if (!storeId) return;

      // For each accepted-side item:
      //   - in cart → skip (InCartList items are ignored)
      //   - already in shopping list (qty > 0) → increment by group qty
      //   - not in list (qty = 0 / no entry) → set to group qty
      const acceptedItemKeys =
        acceptedSide === 1 ? group.itemKeys1 : group.itemKeys2;
      const acceptedQtys =
        acceptedSide === 1
          ? group.quantities1 ?? group.itemKeys1.map(() => 1)
          : group.quantities2 ?? group.itemKeys2.map(() => 1);

      for (const [i, key] of acceptedItemKeys.entries()) {
        const isInCart = (state.storeSpecificValuesMap[key] as any)?.[
          StoreSpecificValueKey.IsInCart
        ]?.[storeId];
        if (isInCart) continue;

        if (!state.storeSpecificValuesMap[key]) {
          (state.storeSpecificValuesMap as any)[key] = {};
        }
        const entry = state.storeSpecificValuesMap[key] as any;
        if (!entry[StoreSpecificValueKey.Quantity]) {
          entry[StoreSpecificValueKey.Quantity] = {};
        }
        if (!entry[StoreSpecificValueKey.IsInCart]) {
          entry[StoreSpecificValueKey.IsInCart] = {};
        }
        const currentQty = entry[StoreSpecificValueKey.Quantity][storeId] ?? 0;
        entry[StoreSpecificValueKey.Quantity][storeId] =
          currentQty + acceptedQtys[i];
        entry[StoreSpecificValueKey.IsInCart][storeId] = false;
      }
    },
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
    addInventoryLocation: (
      state: ListsState,
      action: PayloadAction<InventoryLocation>,
    ) => {
      addInventoryLocationHelper(state, action.payload, true);
    },
    addInventoryLocations: (
      state: ListsState,
      action: PayloadAction<InventoryLocation[]>,
    ) => {
      const locations = action.payload;
      for (let index = 0; index < locations.length; index++) {
        const location = locations[index];
        addInventoryLocationHelper(
          state,
          location,
          index === locations.length - 1,
        );
      }
    },
    addItemToCart: (
      state: ListsState,
      action: PayloadAction<ItemWithStoreSpecificValues>,
    ) => {
      const itemToAdd = action.payload;
      const keyToUse = getKeyToUse(itemToAdd);
      if (!itemToAdd) return;
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
    addItemsToItemsList: (
      state: ListsState,
      action: PayloadAction<ItemsList>,
    ) => {
      const itemsList = action.payload;
      state[ListName.ItemsList] = {
        data: [
          ...(state[ListName.ItemsList]?.data || []),
          ...(itemsList?.data || []),
        ],
        filters: itemsList.filters,
        sortOrderValue: itemsList.sortOrderValue,
      };
    },
    addMutuallyExclusiveGroup: (
      state: ListsState,
      action: PayloadAction<AddMutuallyExclusiveGroupPayload>,
    ) => {
      if (!state.mutuallyExclusiveGroups) state.mutuallyExclusiveGroups = [];
      const { itemKeys1, itemKeys2, quantities1, quantities2 } = action.payload;

      const sortedId = (keys: string[]) => [...keys].sort().join('|');
      const id1 = sortedId(itemKeys1);
      const id2 = sortedId(itemKeys2);
      const already = state.mutuallyExclusiveGroups.some((g) => {
        const gId1 = sortedId(g.itemKeys1);
        const gId2 = sortedId(g.itemKeys2);
        return (gId1 === id1 && gId2 === id2) || (gId1 === id2 && gId2 === id1);
      });
      if (already) return;

      state.mutuallyExclusiveGroups.push({
        id: `${id1}__${id2}__${Date.now()}`,
        name: action.payload.name,
        itemKeys1,
        itemKeys2,
        quantities1: quantities1 ?? itemKeys1.map(() => 1),
        quantities2: quantities2 ?? itemKeys2.map(() => 1),
      });
      // The group is purely a relationship record — shopping list items are
      // not added or modified on group creation.
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
    addStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<ListsState['storeSpecificValuesMap']>,
    ) => {
      if (!action.payload) return;
      state.storeSpecificValuesMap = {
        ...state.storeSpecificValuesMap,
        ...action.payload,
      };
    },
    clearShopping: (state: ListsState) => {
      state.mutuallyExclusiveGroups = [];
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
    copyStoreSpecificValues: (
      state: ListsState,
      action: PayloadAction<CopyStoreSpecificValuesPayload>,
    ) => {
      const { source, destination, items } = action.payload;
      const keysToIgnore = [
        StoreSpecificValueKey.IsInCart.toString(),
        StoreSpecificValueKey.Quantity.toString(),
      ];
      const storeSpecificValuesMapCopy = { ...state.storeSpecificValuesMap };
      if (!source || !destination) return;
      const itemIds = (items || [])?.map((item) => getKeyToUse(item));
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap: state.storeSpecificValuesMap,
        onNewItemStart: ({ itemKey }) => {
          if (items && !itemIds.includes(itemKey)) {
            return ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE;
          }
        },
        onNewStoreSpecificValueStart: ({ storeSpecificValueKey }) => {
          if (keysToIgnore.includes(storeSpecificValueKey)) {
            return ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE;
          }
        },
        onNewStoreValue: ({
          itemKey,
          storeKey,
          storeSpecificValueKey,
          storeValue,
        }) => {
          if (storeValue && storeKey === source._id) {
            const destinationKey = getKeyToUse(destination);
            const currentValue = (
              storeSpecificValuesMapCopy?.[itemKey] as any
            )?.[storeSpecificValueKey][destinationKey];
            if (currentValue) return;

            if (!storeSpecificValuesMapCopy?.[itemKey]) {
              storeSpecificValuesMapCopy[itemKey] = {} as StoreSpecificValues;
            }
            if (
              !(storeSpecificValuesMapCopy?.[itemKey] as any)?.[
                storeSpecificValueKey
              ]
            ) {
              (storeSpecificValuesMapCopy[itemKey] as any)[
                storeSpecificValueKey
              ] = {
                ...(storeSpecificValuesMapCopy[itemKey] as any)[
                  storeSpecificValueKey
                ],
              } as StoreSpecificValue<any>;
            }

            (storeSpecificValuesMapCopy[itemKey] as any)[storeSpecificValueKey][
              destinationKey
            ] = storeValue;
          }
        },
      });
      state.storeSpecificValuesMap = storeSpecificValuesMapCopy;

      //copying the last purchased map values if it's a full store copy
      if (!items || items.length <= 0) {
        const lastPurchasedMapCopy = { ...state.lastPurchasedMap };
        for (const [itemKey, storeValues] of Object.entries(
          state.lastPurchasedMap,
        )) {
          for (const [storeKey, value] of Object.entries(storeValues || {})) {
            const destinationKey = getKeyToUse(destination);
            const currentValue =
              lastPurchasedMapCopy?.[itemKey]?.[destinationKey];
            if (
              value &&
              storeKey === source._id &&
              (!currentValue || value > currentValue)
            ) {
              lastPurchasedMapCopy[itemKey] = {
                ...lastPurchasedMapCopy[itemKey],
                [destinationKey]: value,
              };
            }
          }
        }
        state.lastPurchasedMap = lastPurchasedMapCopy;
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
    insertInventoryItem: (
      state: ListsState,
      action: PayloadAction<InsertInventoryItemPayload>,
    ) => {
      insertInventoryItemHelper(state, action?.payload);
    },
    insertInventoryItems: (
      state: ListsState,
      action: PayloadAction<InsertInventoryItemPayload[]>,
    ) => {
      action?.payload?.forEach((item) =>
        insertInventoryItemHelper(state, item),
      );
    },
    moveAllToInCart: (state: ListsState) => {
      moveItems(state, Object.keys(state.storeSpecificValuesMap));
      state.selectedItemsFromShoppingCart = [];
    },
    moveInventoryItem: (
      state: ListsState,
      action: PayloadAction<MoveInventoryItemPayload>,
    ) => {
      moveInventoryItemsHelper(state, action.payload);
    },
    moveInventoryItems: (
      state: ListsState,
      action: PayloadAction<MoveInventoryItemPayload[]>,
    ) => {
      for (const payload of action?.payload || []) {
        moveInventoryItemsHelper(state, payload);
      }
    },
    moveInventoryItemExpirationDates: (
      state: ListsState,
      action: PayloadAction<MoveInventoryItemExpirationDates[]>,
    ) => {
      if (!action.payload || action.payload.length === 0) {
        return;
      }
      for (const moveInventoryItemToLocationItem of action.payload) {
        const { itemId, originLocationId, targetLocationId, expirationDates } =
          moveInventoryItemToLocationItem;
        if (
          !itemId ||
          !originLocationId ||
          !targetLocationId ||
          !expirationDates ||
          expirationDates.length === 0
        ) {
          continue;
        }

        for (const expirationDate of expirationDates) {
          const foundOriginalExpirationDate =
            state.inventory.items?.[originLocationId]?.[itemId]
              ?.expirationDates?.[expirationDate];

          if (
            !foundOriginalExpirationDate ||
            foundOriginalExpirationDate <= 0
          ) {
            continue;
          } else {
            state.inventory.items[originLocationId][itemId].expirationDates[
              expirationDate
            ]--;
          }

          if (!state.inventory.items[targetLocationId]) {
            state.inventory.items[targetLocationId] = {};
          }
          if (!state.inventory.items[targetLocationId][itemId]) {
            state.inventory.items[targetLocationId][itemId] = {
              expirationDates: {
                [expirationDate]: 1,
              },
            } as InventoryItemWithItemDetails;
          } else {
            state.inventory.items[targetLocationId][itemId].expirationDates[
              expirationDate
            ]++;
          }
        }

        if (
          state.inventory.items[originLocationId]?.[itemId]?.expirationDates &&
          getExpirationDatesQuantity(
            state.inventory.items[originLocationId][itemId].expirationDates,
          ) === 0
        ) {
          delete state.inventory.items[originLocationId][itemId];
        }
      }
    },
    moveItemToAnotherCart: (
      state: ListsState,
      action: PayloadAction<MoveItemToAnotherCartPayload>,
    ) => {
      const { item, store } = action.payload;
      if (!item || !store) return;
      const keyToUse = getKeyToUse(item);
      if (!state.storeSpecificValuesMap?.[keyToUse]) {
        state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues;
      }

      if (
        state.storeSpecificValuesMap?.[keyToUse]?.[
          StoreSpecificValueKey.Quantity
        ]
      ) {
        const currentQuantity =
          state.storeSpecificValuesMap[keyToUse][
            StoreSpecificValueKey.Quantity
          ][state.currentStoreId] || 1;
        state.storeSpecificValuesMap[keyToUse][StoreSpecificValueKey.Quantity][
          getKeyToUse(store)
        ] = currentQuantity;
        state.storeSpecificValuesMap[keyToUse][StoreSpecificValueKey.Quantity][
          state.currentStoreId
        ] = 0;
      }
      if (
        state.storeSpecificValuesMap?.[keyToUse]?.[
          StoreSpecificValueKey.IsInCart
        ]
      ) {
        state.storeSpecificValuesMap[keyToUse][StoreSpecificValueKey.IsInCart][
          state.currentStoreId
        ] = false;
      }
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
    processItemToLocationMap: (
      state: ListsState,
      action: PayloadAction<ProcessItemToLocationMap>,
    ) => {
      const itemPayload = action.payload;
      const { itemToLocationMap } = itemPayload;
      for (const [itemId, locationObj] of Object.entries(itemToLocationMap)) {
        const { locationId, timeToExpiration, quantity } = locationObj;
        if (!itemId || !locationId || !timeToExpiration || quantity <= 0) {
          continue;
        }
        if (!state.inventory.items[locationId]) {
          state.inventory.items[locationId] = {};
        }
        if (!state.inventory.items[locationId][itemId]) {
          state.inventory.items[locationId][itemId] = {
            expirationDates: {},
          } as InventoryItemWithItemDetails;
        }
        if (!state.inventory.items[locationId][itemId].expirationDates) {
          state.inventory.items[locationId][itemId].expirationDates = {};
        }
        state.inventory.items[locationId][itemId].expirationDates = {
          ...state.inventory.items[locationId][itemId].expirationDates,
          [Date.now() + timeToExpiration]: quantity,
        };
      }
    },
    removeMostRecentInventoryItem: (
      state: ListsState,
      action: PayloadAction<
        Pick<RemoveInventoryItemPayload, 'itemId' | 'locationId'>
      >,
    ) => {
      const itemPayload = action.payload;
      const { itemId, locationId } = itemPayload;
      if (
        !itemId ||
        !locationId ||
        !state.inventory.items[locationId]?.[itemId]?.expirationDates
      ) {
        return;
      }
      if (
        getExpirationDatesQuantity(
          state.inventory.items[locationId][itemId].expirationDates,
        ) <= 0
      ) {
        delete state.inventory.items[locationId][itemId];
      } else {
        const mostRecentExpirationDate = Object.keys(
          getMostRecentExpirationDates(
            state.inventory.items[locationId][itemId].expirationDates,
            1,
          ),
        );

        state.inventory.items[locationId][itemId].expirationDates[
          mostRecentExpirationDate[0]
        ]--;

        if (
          getExpirationDatesQuantity(
            state.inventory.items[locationId][itemId].expirationDates,
          ) <= 0
        ) {
          delete state.inventory.items[locationId][itemId];
        } else if (
          state.inventory.items[locationId][itemId].expirationDates[
            mostRecentExpirationDate[0]
          ] <= 0
        ) {
          delete state.inventory.items[locationId][itemId].expirationDates[
            mostRecentExpirationDate[0]
          ];
        }
      }
      state.inventory.lastDecrementedItemId = itemId;
    },
    removeMutuallyExclusiveGroup: (
      state: ListsState,
      action: PayloadAction<RemoveMutuallyExclusiveGroupPayload>,
    ) => {
      if (!state.mutuallyExclusiveGroups) {
        state.mutuallyExclusiveGroups = [];
        return;
      }

      const groupToRemove = state.mutuallyExclusiveGroups.find(
        (g) => g.id === action.payload.id,
      );

      state.mutuallyExclusiveGroups = state.mutuallyExclusiveGroups.filter(
        (g) => g.id !== action.payload.id,
      );

      if (!groupToRemove || action.payload.keepItems) return;

      const storeId = state.currentStoreId;
      if (!storeId) return;

      for (const key of [
        ...groupToRemove.itemKeys1,
        ...groupToRemove.itemKeys2,
      ]) {
        // Leave the item alone if it belongs to another ME group
        const inAnotherGroup = state.mutuallyExclusiveGroups.some(
          (g) => g.itemKeys1.includes(key) || g.itemKeys2.includes(key),
        );
        if (inAnotherGroup) continue;

        const entry = state.storeSpecificValuesMap[key] as any;
        if (!entry) continue;

        // Don't touch items the user has already moved to cart
        const isInCart = entry?.[StoreSpecificValueKey.IsInCart]?.[storeId];
        if (isInCart) continue;

        const currentQty =
          entry?.[StoreSpecificValueKey.Quantity]?.[storeId] ?? 0;
        if (currentQty <= 0) continue;

        entry[StoreSpecificValueKey.Quantity][storeId] = 0;
      }
    },
    removeInventoryItem: (
      state: ListsState,
      action: PayloadAction<RemoveInventoryItemPayload>,
    ) => {
      const itemPayload = action.payload;
      removeInventoryItemHelper(state, itemPayload);
    },
    removeInventoryItems: (
      state: ListsState,
      action: PayloadAction<RemoveInventoryItemPayload[]>,
    ) => {
      const itemPayload = action.payload;
      for (const item of itemPayload) {
        removeInventoryItemHelper(state, item);
      }
    },
    removeInventoryLocation: (
      state: ListsState,
      action: PayloadAction<InventoryLocation>,
    ) => {
      const location = action.payload;
      removeInventoryLocationHelper(state, location);
    },
    removeInventoryLocations: (
      state: ListsState,
      action: PayloadAction<InventoryLocation[]>,
    ) => {
      const locations = action.payload;
      for (const location of locations) {
        removeInventoryLocationHelper(state, location);
      }
    },
    removeItemFromMutuallyExclusiveGroup: (
      state: ListsState,
      action: PayloadAction<RemoveItemFromMutuallyExclusiveGroupPayload>,
    ) => {
      const { groupId, side, itemKey } = action.payload;
      const groupIdx = state.mutuallyExclusiveGroups.findIndex(
        (g) => g.id === groupId,
      );
      if (groupIdx === -1) return;
      const group = state.mutuallyExclusiveGroups[groupIdx];
      const keysField = side === 1 ? 'itemKeys1' : 'itemKeys2';
      const qtysField = side === 1 ? 'quantities1' : 'quantities2';
      const itemIdx = group[keysField].indexOf(itemKey);
      if (itemIdx === -1) return;

      group[keysField] = group[keysField].filter((_, i) => i !== itemIdx);
      group[qtysField] = group[qtysField].filter((_, i) => i !== itemIdx);

      // Helper to zero a key's quantity if safe to do so
      const storeId = state.currentStoreId;
      const zeroIfSafe = (key: string) => {
        if (!storeId) return;
        const inAnotherGroup = state.mutuallyExclusiveGroups.some(
          (g) =>
            g.id !== groupId &&
            (g.itemKeys1.includes(key) || g.itemKeys2.includes(key)),
        );
        if (inAnotherGroup) return;
        const entry = state.storeSpecificValuesMap[key] as any;
        if (!entry) return;
        if (entry?.[StoreSpecificValueKey.IsInCart]?.[storeId]) return;
        const qty = entry?.[StoreSpecificValueKey.Quantity]?.[storeId] ?? 0;
        if (qty > 0) entry[StoreSpecificValueKey.Quantity][storeId] = 0;
      };

      // If a side is now empty the whole group must go
      if (group.itemKeys1.length === 0 || group.itemKeys2.length === 0) {
        for (const key of [...group.itemKeys1, ...group.itemKeys2]) {
          zeroIfSafe(key);
        }
        state.mutuallyExclusiveGroups.splice(groupIdx, 1);
        return;
      }

      // Only zero the removed item if it isn’t still on the other side
      const otherSideKeys = side === 1 ? group.itemKeys2 : group.itemKeys1;
      if (!otherSideKeys.includes(itemKey)) zeroIfSafe(itemKey);
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
      removeItemsFromInventory(
        state,
        action.payload?.map((item) => getKeyToUse(item)),
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
      emptyList.data = (state as any)[listName]?.data || [];
      (state as any)[listName] = emptyList;

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
      emptyList.data = (state as any)[listName].data || [];
      emptyList.sortOrderValue = (state as any)[listName].sortOrderValue;
      (state as any)[listName] = emptyList;
    },
    resetInventoryItems: (state: ListsState) => {
      state.inventory.items = {};
    },
    resetInventoryLocations: (state: ListsState) => {
      state.inventory.locations = [];
      state.inventory.currentLocationId = null;
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
    setCurrentInventoryLocationId: (
      state: ListsState,
      action: PayloadAction<InventoryLocation['_id'] | undefined | null>,
    ) => {
      const locationId = action.payload;
      if (locationId) {
        state.inventory.currentLocationId = locationId;
      } else {
        state.inventory.currentLocationId = null;
      }
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

      (state as any)[listName].filters = filters;
    },
    setInventory: (state: ListsState, action: PayloadAction<Inventory>) => {
      const { items, locations, currentLocationId } = action.payload;
      if (!items || !locations) {
        return;
      }
      state.inventory.items = items || {};
      state.inventory.locations = locations || [];
      if (locations && locations.length > 0) {
        state.inventory.currentLocationId =
          currentLocationId || locations[0]?._id || null;
      } else {
        state.inventory.currentLocationId = null;
      }
    },
    setItemsList: (
      state: ListsState,
      action: PayloadAction<ListsState['itemsList']>,
    ) => {
      if (!action.payload) return;
      state.itemsList = action.payload;
    },
    setLastDecrementedItemId: (
      state: ListsState,
      action: PayloadAction<string>,
    ) => {
      state.inventory.lastDecrementedItemId = action.payload || EMPTY_STRING;
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
      const listToSort = (state as any)[listName];

      if (!listToSort) {
        alert(`Unable to find a list with name of '${listName}'.`);
        return;
      }

      const newSortBy =
        sortBy || (state as any)[listName].sortOrderValue.sortBy;
      const newSortOrder =
        sortOrder || (state as any)[listName].sortOrderValue.sortOrder;
      listToSort.data?.sort(
        getSorter({
          sortType: newSortBy,
          currentStoreId: state.currentStoreId,
          sortOrder: newSortOrder,
        }),
      );

      (state as any)[listName].sortOrderValue = {
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      };
    },
    setMutuallyExclusiveGroups: (
      state: ListsState,
      action: PayloadAction<MutuallyExclusiveGroup[]>,
    ) => {
      state.mutuallyExclusiveGroups = action.payload ?? [];
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

      if (!(state as any)[listName].sortOrderValue) return;
      const sortOrder =
        (state as any)[listName].sortOrderValue?.sortOrder ===
        SortOrder.Ascending
          ? SortOrder.Descending
          : SortOrder.Ascending;

      (state as any)[listName].sortOrderValue.sortOrder = sortOrder;
    },
    updateMutuallyExclusiveGroup: (
      state: ListsState,
      action: PayloadAction<UpdateMutuallyExclusiveGroupPayload>,
    ) => {
      const { id, itemKeys1, itemKeys2, quantities1, quantities2 } =
        action.payload;
      const group = state.mutuallyExclusiveGroups.find((g) => g.id === id);
      if (!group) return;

      const storeId = state.currentStoreId;
      const oldAllKeys = new Set([...group.itemKeys1, ...group.itemKeys2]);
      const newAllKeys = new Set([...itemKeys1, ...itemKeys2]);

      // Zero quantities for items removed from the group
      if (storeId) {
        for (const key of oldAllKeys) {
          if (newAllKeys.has(key)) continue;
          const inAnotherGroup = state.mutuallyExclusiveGroups.some(
            (g) =>
              g.id !== id &&
              (g.itemKeys1.includes(key) || g.itemKeys2.includes(key)),
          );
          if (inAnotherGroup) continue;
          const entry = state.storeSpecificValuesMap[key] as any;
          if (!entry) continue;
          if (entry?.[StoreSpecificValueKey.IsInCart]?.[storeId]) continue;
          const qty = entry?.[StoreSpecificValueKey.Quantity]?.[storeId] ?? 0;
          if (qty > 0) entry[StoreSpecificValueKey.Quantity][storeId] = 0;
        }
      }

      // Update the group
      group.name = action.payload.name;
      group.itemKeys1 = itemKeys1;
      group.itemKeys2 = itemKeys2;
      group.quantities1 = quantities1;
      group.quantities2 = quantities2;

      // Add newly introduced items to the shopping list
      if (storeId) {
        const allKeys = [...itemKeys1, ...itemKeys2];
        const allQtys = [...quantities1, ...quantities2];
        for (const [i, key] of allKeys.entries()) {
          if (oldAllKeys.has(key)) continue; // already in the list
          const currentQty =
            (state.storeSpecificValuesMap[key] as any)?.[
              StoreSpecificValueKey.Quantity
            ]?.[storeId] ?? 0;
          if (currentQty > 0) continue;
          if (!state.storeSpecificValuesMap[key]) {
            (state.storeSpecificValuesMap as any)[key] = {};
          }
          const entry = state.storeSpecificValuesMap[key] as any;
          if (!entry[StoreSpecificValueKey.Quantity]) {
            entry[StoreSpecificValueKey.Quantity] = {};
          }
          entry[StoreSpecificValueKey.Quantity][storeId] = allQtys[i];
          if (!entry[StoreSpecificValueKey.IsInCart]) {
            entry[StoreSpecificValueKey.IsInCart] = {};
          }
          entry[StoreSpecificValueKey.IsInCart][storeId] = false;
        }
      }
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

export const mutuallyExclusiveGroupsSelector = (state: RootState) =>
  state[listsSlice.name].mutuallyExclusiveGroups ?? [];

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

/**
 *This selector is used to get the list count for an item, i.e. how many quantity are in all of the store lists.

 *@returns current inventory count for the item in the specified inventory location and any store lists.
 **/
export const itemInListsCountSelector = ({
  itemId,
  includeInCartItems = true,
}: {
  itemId: string;
  includeInCartItems?: boolean;
}) =>
  createSelector(
    [(state: RootState) => state.lists.storeSpecificValuesMap],
    (storeSpecificValuesMap) => {
      if (!itemId) {
        return EMPTY_NUMBER;
      }
      const itemStoreSpecificValues = storeSpecificValuesMap[itemId] || {};
      const storeListCount = Object.entries(itemStoreSpecificValues).reduce(
        (acc, [key, store]) => {
          if (!store || key !== StoreSpecificValueKey.Quantity) {
            return acc;
          }

          const quantityInAllLists = Object.entries(store || {}).reduce(
            (acc, [storeId, storeSpecificValue]) => {
              const shouldInclude = !includeInCartItems
                ? !itemStoreSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[
                    storeId
                  ]
                : true;

              if (!shouldInclude) {
                return acc;
              }

              return acc + (storeSpecificValue || 0);
            },
            EMPTY_NUMBER,
          );
          return acc + quantityInAllLists;
        },
        EMPTY_NUMBER,
      );
      return storeListCount;
    },
  );

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
    [(state: RootState) => (state[listsSlice.name] as any)?.[listName]],
    (list) => {
      if (!list) return [];
      const { filters, sortOrderValue, data } = list;

      const filteredList = getFilteredList<unknown>(data, filters);
      filteredList.sort(
        getSorter({
          sortType: sortOrderValue.sortBy,
          sortOrder: sortOrderValue.sortOrder,
        }),
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
      getSorter({
        sortType: previouslyPurchasedList.sortOrderValue?.sortBy,
        currentStoreId,
        sortOrder: previouslyPurchasedList.sortOrderValue?.sortOrder,
      }),
    );
  },
);

export const previouslyPurchasedListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.PreviouslyPurchased];

export const priceOfItemsSelector = (listname: ListName) =>
  createSelector(
    [
      (state: RootState) => (state[listsSlice.name] as any)[listname],
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
export const storeSpecificListSelector = (
  listname: ListName,
  shouldFilterAndSort = false,
) =>
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

      if (!shouldFilterAndSort) return listToDisplay;

      const filteredList = getFilteredList<ItemWithStoreSpecificValues>(
        listToDisplay,
        listname === ListName.ShoppingList
          ? shoppingList.filters
          : inCartList.filters,
      );
      filteredList.sort(
        getSorter({
          sortType:
            listname === ListName.ShoppingList
              ? shoppingList.sortOrderValue.sortBy
              : inCartList.sortOrderValue.sortBy,
          currentStoreId,
          sortOrder:
            listname === ListName.ShoppingList
              ? shoppingList.sortOrderValue.sortOrder
              : inCartList.sortOrderValue.sortOrder,
        }),
      );
      return filteredList;
    },
  );

export const shoppingListSelector = (state: RootState) =>
  state[listsSlice.name][ListName.ShoppingList];

//Note: this is currently exponential time complexity
export const storeItemsCountSelector = (storeId: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].storeSpecificValuesMap],
    (storeSpecificValuesMap) => {
      if (!storeId) return EMPTY_NUMBER;
      const items = new Set<string>();
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap,
        onNewStoreSpecificValueStart: (input) => {
          const { storeSpecificValueKey } = input;
          if (
            storeSpecificValueKey !== StoreSpecificValueKey.IsInCart &&
            storeSpecificValueKey !== StoreSpecificValueKey.Quantity
          ) {
            return ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE;
          }
        },
        onNewStoreValue: (input) => {
          const { storeSpecificValues, itemKey, storeKey } = input;
          if (storeKey !== storeId) return;
          if (
            storeSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[storeId] ||
            (storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[storeId] &&
              storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[storeId] >
                0)
          ) {
            items.add(itemKey);
          }
        },
      });
      return items.size;
    },
  );

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
  acceptMutuallyExclusiveGroupSide,
  addAllToShoppingCart,
  addInventoryLocation,
  addInventoryLocations,
  addItemsListItem,
  addItemsToItemsList,
  addItemToCart,
  addMutuallyExclusiveGroup,
  addStoresListItem,
  addStoreSpecificValues,
  clearShopping,
  completePurchase,
  copyStoreSpecificValues,
  handleLoadAllResponse,
  handleSaveAllResponse,
  insertInventoryItem,
  insertInventoryItems,
  moveAllToInCart,
  moveInventoryItem,
  moveInventoryItemExpirationDates,
  moveInventoryItems,
  moveItemToAnotherCart,
  moveItemToShoppingList,
  moveSelectedPreviouslyPurchasedItemsToShopping,
  moveSelectedToCart,
  moveSelectedToShopping,
  processItemToLocationMap,
  removeInventoryItem,
  removeInventoryItems,
  removeInventoryLocation,
  removeInventoryLocations,
  removeItemFromMutuallyExclusiveGroup,
  removeItemsListItems,
  removeMostRecentInventoryItem,
  removeMutuallyExclusiveGroup,
  removeShoppingListItems,
  removeStoresListItems,
  resetCurrentLocation,
  resetCurrentLocationState,
  resetCurrentStoreId,
  resetInventoryItems,
  resetInventoryLocations,
  resetItemsList,
  resetLastPurchasedMap,
  resetListSlice,
  resetListToDisplay,
  resetListToDisplayFilters,
  resetSelectedItemsInShopping,
  resetStoresList,
  setCurrentInventoryLocationId,
  setCurrentLocation,
  setCurrentLocationState,
  setCurrentStoreId,
  setFilters,
  setInventory,
  setIsMultiSelectModeForInCartCart,
  setIsMultiSelectModeForPreviouslyPurchased,
  setIsMultiSelectModeForShoppingCart,
  setItemsList,
  setLastDecrementedItemId,
  setLastPurchasedMap,
  setSortOrder,
  setMutuallyExclusiveGroups,
  setStoresList,
  setStoreSpecificValues,
  toggleSortOrder,
  updateMutuallyExclusiveGroup,
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

  const itemIndex = (state as any)[listName].data.findIndex((item: Key) => {
    const keyLocal = getKeyToUse(item);
    return keyLocal === itemKeyToUse;
  });

  if (itemIndex > -1) {
    (state as any)[listName].data[itemIndex] = item as any;
  } else {
    (state as any)[listName].data.push(item as any);
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
  (state as any)[listName].data = (state as any)[listName].data.filter(
    (item: Key) => {
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
    },
  ) as any;

  for (const keyToUse of keysToUse) {
    state.storeSpecificValuesMap[keyToUse] = {} as StoreSpecificValues;
  }
}

function removeItemsFromInventory(state: ListsState, itemIds: string[]) {
  if (!state?.inventory.items || !itemIds || itemIds.length === 0) return;
  for (const itemId of itemIds) {
    for (const locationId of Object.keys(state.inventory.items || {})) {
      if (state.inventory.items[locationId]?.[itemId]) {
        delete state.inventory.items[locationId][itemId];
      }
    }
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

//#region Inventory Stuff

export const currentInventoryLocationIdSelector = (state: RootState) =>
  state[listsSlice.name].inventory.currentLocationId || EMPTY_STRING;

export const currentInventoryLocationSelector = (state: RootState) =>
  state[listsSlice.name].inventory.locations.find(
    (location) =>
      location._id === state[listsSlice.name].inventory.currentLocationId,
  ) || null;

export const currentInventoryLocationItemsSelector = createSelector(
  [
    (state: RootState) => state.lists.itemsList.data,
    (state: RootState) => state[listsSlice.name].inventory.items,
    (state: RootState) => state[listsSlice.name].inventory.locations,
    (state: RootState) => state[listsSlice.name].inventory.currentLocationId,
  ],
  (itemsList, inventoryItems, inventoryLocations, currentLocationId) => {
    const currentLocation =
      inventoryLocations.find(
        (location) => location._id === currentLocationId,
      ) || null;
    if (!currentLocation || !inventoryItems?.[currentLocation._id]) {
      return {};
    }
    const currentInventoryLocationItems = {
      ...inventoryItems[currentLocation._id],
    };

    for (const [itemId, currentInventoryLocationItem] of Object.entries(
      currentInventoryLocationItems,
    )) {
      const itemFound = itemsList.find((item) => {
        return item._id === itemId;
      });
      if (itemFound) {
        currentInventoryLocationItems[itemId] = {
          ...currentInventoryLocationItem,
          item: itemFound,
        } as InventoryItemWithItemDetails;
      }
    }
    return currentInventoryLocationItems as InventoryLocationItem<InventoryItemWithItemDetails>;
  },
);

export const inventoryItemSelector = ({
  /**
   *The id of the item to which the inventory item corresponds.
   **/
  itemId,
  /**
   *The locationId to use. If not provided, the currentLocationId will be used.
   **/
  locationId = EMPTY_STRING,
}: InventoryItemSelectorProps) =>
  createSelector(
    [
      (state: RootState) => state.lists.itemsList.data,
      (state: RootState) => state[listsSlice.name].inventory.items,
      (state: RootState) => state[listsSlice.name].inventory.currentLocationId,
    ],
    (itemsList, inventoryItems, currentLocationId) => {
      if (!itemId) {
        return {
          item: undefined,
          inventoryItem: undefined,
        } as InventoryItemSelectorResponse;
      }
      const itemFound = itemsList.find((item) => item._id === itemId);
      const inventoryItemFound =
        inventoryItems[locationId || currentLocationId || EMPTY_STRING]?.[
          itemId
        ];
      return {
        inventoryItem: inventoryItemFound,
        item: itemFound,
      } as InventoryItemSelectorResponse;
    },
  );

export const inventorySelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].inventory.items,
    (state: RootState) => state[listsSlice.name].inventory.locations,
    (state: RootState) => state[listsSlice.name].inventory.currentLocationId,
  ],
  (items, locations, currentLocationId) => {
    return {
      currentLocationId,
      items,
      locations,
    } as Inventory;
  },
);

export const inventoryItemsSelector = (state: RootState) =>
  state[listsSlice.name].inventory.items;

export const inventoryLocationsSelector = (state: RootState) =>
  state[listsSlice.name].inventory.locations;

export const lastDecrementedItemIdSelector = (state: RootState) =>
  state[listsSlice.name].inventory.lastDecrementedItemId;

//#region Helpers
function addInventoryLocationHelper(
  state: ListsState,
  location: InventoryLocation,
  shouldMakeCurrentLocationId: boolean = true,
) {
  const { _id } = location;
  if (!_id) {
    return;
  }
  if (!state.inventory.locations) {
    state.inventory.locations = [location];
  } else {
    const index = state.inventory.locations.findIndex((l) => l._id === _id);
    if (index === -1) {
      state.inventory.locations.push(location);
    } else {
      state.inventory.locations[index] = location;
    }
  }
  if (shouldMakeCurrentLocationId) {
    state.inventory.currentLocationId = _id;
  }
}

function moveInventoryItemsHelper(
  state: ListsState,
  payload: MoveInventoryItemPayload,
) {
  const { itemId, originLocationId, targetLocationId } = payload;

  const originLocationIdToUse =
    originLocationId || state.inventory.currentLocationId || EMPTY_STRING;

  if (!itemId || !originLocationIdToUse || !targetLocationId) {
    return;
  }
  const originalEntryCopy = state.inventory.items?.[originLocationIdToUse]?.[
    itemId
  ]
    ? {
        ...state.inventory.items?.[originLocationIdToUse]?.[itemId],
      }
    : null;
  if (!originalEntryCopy) {
    return;
  }

  delete state.inventory.items[originLocationIdToUse][itemId];

  if (!state.inventory.items[targetLocationId]) {
    state.inventory.items[targetLocationId] = {};
  }
  if (!state.inventory.items[targetLocationId][itemId]) {
    state.inventory.items[targetLocationId][itemId] = {
      expirationDates: originalEntryCopy.expirationDates,
    } as InventoryItemWithItemDetails;
  } else {
    if (!state.inventory.items[targetLocationId][itemId].expirationDates) {
      state.inventory.items[targetLocationId][itemId].expirationDates = {};
    }
    state.inventory.items[targetLocationId][itemId].expirationDates = {
      ...state.inventory.items[targetLocationId][itemId].expirationDates,
      ...originalEntryCopy.expirationDates,
    };
  }
}

function removeInventoryItemHelper(
  state: ListsState,
  itemPayload: RemoveInventoryItemPayload,
) {
  const { itemId, locationId, expirationDates } = itemPayload;
  const inventoryLocationIdToUse =
    locationId || state.inventory.currentLocationId;
  if (
    !itemId ||
    !inventoryLocationIdToUse ||
    !state.inventory.items[inventoryLocationIdToUse]?.[itemId]?.expirationDates
  ) {
    return;
  }
  if (
    getExpirationDatesQuantity(
      state.inventory.items[inventoryLocationIdToUse]?.[itemId]
        ?.expirationDates,
    ) <= 0
  ) {
    delete state.inventory.items[inventoryLocationIdToUse][itemId];
  } else {
    state.inventory.items[inventoryLocationIdToUse][itemId].expirationDates =
      getUpdatedExpirationDates(
        state.inventory.items[inventoryLocationIdToUse][itemId].expirationDates,
        expirationDates,
        'remove',
      );

    if (
      getExpirationDatesQuantity(
        state.inventory.items[inventoryLocationIdToUse][itemId].expirationDates,
      ) <= 0
    ) {
      delete state.inventory.items[inventoryLocationIdToUse][itemId];
    }
  }
  state.inventory.lastDecrementedItemId = itemId;
}

function removeInventoryLocationHelper(
  state: ListsState,
  location: InventoryLocation,
) {
  const { _id } = location;
  if (!_id) {
    return;
  }
  if (!state.inventory.locations) {
    return;
  }
  const index = state.inventory.locations.findIndex((l) => l._id === _id);
  if (index === -1) {
    return;
  }

  //remove the location from the list of locations
  state.inventory.locations.splice(index, 1);
  //remove all items for this location
  Object.keys(state.inventory.items).forEach((locationId) => {
    if (locationId === _id) {
      delete state.inventory.items[locationId];
    }
  });

  if (state.inventory.currentLocationId === _id) {
    state.inventory.currentLocationId = EMPTY_STRING;
  }
}

function insertInventoryItemHelper(
  state: ListsState,
  itemPayload: InsertInventoryItemPayload,
) {
  const { item, itemId, locationId } = itemPayload || {};
  const { expirationDates } = item || {};
  const inventoryLocationIdToUse =
    locationId || state.inventory.currentLocationId || EMPTY_STRING;

  if (!itemId || !inventoryLocationIdToUse || !expirationDates) {
    return;
  }
  if (!state.inventory.items[inventoryLocationIdToUse]) {
    state.inventory.items[inventoryLocationIdToUse] = {
      [itemId]: item,
    };
  } else if (
    !state.inventory.items[inventoryLocationIdToUse][itemId]?.expirationDates
  ) {
    state.inventory.items[inventoryLocationIdToUse][itemId] = item;
  } else if (state.inventory.items[inventoryLocationIdToUse][itemId]) {
    state.inventory.items[inventoryLocationIdToUse][itemId].expirationDates =
      getUpdatedExpirationDates(
        state.inventory.items[inventoryLocationIdToUse][itemId].expirationDates,
        expirationDates,
        'add',
      );
  }
  state.inventory.lastDecrementedItemId = EMPTY_STRING;
}
//#endregion

//#endregion
