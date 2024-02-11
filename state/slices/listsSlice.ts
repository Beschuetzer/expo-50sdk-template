import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { EMPTY_STRING } from "@/constants/general";
import {
  Item,
  ItemsList,
  Key,
  LastPurchasedItem,
  LastPurchasedList,
  ShoppingList,
  StoreList,
} from "@/types/Item";
import { Store } from "@/types/Store";
import { getEmptyObject, getKeyToUse } from "@/utils/helpers";

/**
 * {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
 * {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
 * {@link ListsState.shoppingList shoppingList} is the items currently being bought
 * {@link ListsState.stores stores} is a list of the stores created
 **/
export type ListsState = {
  currentStoreName: string;
  itemsList: ItemsList;
  lastPurchasedList: LastPurchasedList;
  shoppingList: ShoppingList;
  storesList: StoreList;
};

const initialState: ListsState = {
  currentStoreName: EMPTY_STRING,
  itemsList: getEmptyObject(),
  lastPurchasedList: getEmptyObject(),
  shoppingList: getEmptyObject(),
  storesList: getEmptyObject(),
};

export const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    addItemsListItem: (state: ListsState, action: PayloadAction<Item>) => {
      const keyToUse = getKeyToUse(action.payload);

      if (!keyToUse) {
        alert(
          "Unable to add an item with no name and no upc to the itemsList.",
        );
        return;
      }
      state.itemsList = {
        ...state.itemsList,
        [keyToUse]: action.payload,
      };
    },
    addLastPurchasedList: (
      state: ListsState,
      action: PayloadAction<LastPurchasedItem>,
    ) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          "Unable to add an item with no name and no upc to the lastPurchasedList.",
        );
        return;
      }
      state.lastPurchasedList = {
        ...state.lastPurchasedList,
        [keyToUse]: action.payload,
      };
    },
    addShoppingListItem: (state: ListsState, action: PayloadAction<Item>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          "Unable to add an item with no name and no upc to the shoppingList.",
        );
        return;
      }
      state.shoppingList = {
        ...state.shoppingList,
        [keyToUse]: action.payload,
      };
    },
    addStoresListItem: (state: ListsState, action: PayloadAction<Store>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert("Unable to add an item with no name to the storesList.");
        return;
      }

      state.storesList = {
        ...state.storesList,
        [keyToUse]: action.payload,
      };

      const currentStores = Object.values(state.storesList || {});
      if (currentStores.length === 1) {
        state.currentStoreName = currentStores[0].name;
      }
    },
    removeItemsListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the itemsList.",
        );
        return;
      }
      delete state.itemsList[keyToUse];
    },
    removeLastPurchasedList: (
      state: ListsState,
      action: PayloadAction<Key>,
    ) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the lastPurchasedList.",
        );
        return;
      }
      delete state.lastPurchasedList[keyToUse];
    },
    removeShoppingListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the shoppingList.",
        );
        return;
      }
      delete state.shoppingList[keyToUse];
    },
    removeStoresListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action.payload);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the storesList.",
        );
        return;
      }
      delete state.storesList[keyToUse];
    },
    resetItemsList: (state: ListsState) => {
      state.itemsList = getEmptyObject();
    },
    resetLastPurchasedList: (state: ListsState) => {
      state.lastPurchasedList = getEmptyObject();
    },
    resetShoppingList: (state: ListsState) => {
      state.shoppingList = getEmptyObject();
    },
    resetStoresList: (state: ListsState) => {
      state.storesList = getEmptyObject();
      state.currentStoreName = EMPTY_STRING;
    },
    resetCurrentStoreName: (state: ListsState) => {
      state.currentStoreName = EMPTY_STRING;
    },
    setCurrentStoreName: (
      state: ListsState,
      action: PayloadAction<string | undefined>,
    ) => {
      if (!action.payload) return;
      state.currentStoreName = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addItemsListItem,
  addLastPurchasedList,
  addShoppingListItem,
  addStoresListItem,
  removeItemsListItem,
  removeLastPurchasedList,
  removeShoppingListItem,
  removeStoresListItem,
  resetItemsList,
  resetLastPurchasedList,
  resetShoppingList,
  resetStoresList,
  resetCurrentStoreName,
  setCurrentStoreName,
} = listsSlice.actions;

export default listsSlice.reducer;

export const currentStoreSelector = createSelector(
  [
    (state: RootState) => state[listsSlice.name].storesList,
    (state: RootState) => state[listsSlice.name].currentStoreName,
  ],
  (storesList, currentStoreName) => {
    return (storesList?.[currentStoreName] || {
      name: EMPTY_STRING,
      gpsCoordinates: null,
    }) as Store;
  },
);

export const itemsListItemSelector = (id: string) =>
  createSelector(
    [(state: RootState) => (state[listsSlice.name] as ListsState).itemsList],
    (itemsList) => {
      const value = (itemsList as any)?.[id];
      return (value || null) as Item | null;
    },
  );

export const itemsListSelector = (state: RootState) =>
  state[listsSlice.name].itemsList;

export const itemsListArraySelector = createSelector(
  [(state: RootState) => state[listsSlice.name].itemsList],
  (itemsList) => {
    return Object.values(itemsList || {});
  },
);

export const storesListSelector = (state: RootState) =>
  state[listsSlice.name].storesList;

export const storesListArraySelector = createSelector(
  [(state: RootState) => state[listsSlice.name].storesList],
  (storesList) => {
    return Object.values(storesList);
  },
);

export const storesListItemSelector = (storeName: string) =>
  createSelector(
    [(state: RootState) => state[listsSlice.name].storesList],
    (storesList) => {
      const value = storesList[storeName];
      return (value || null) as Store | null;
    },
  );
