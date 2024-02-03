import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Store } from "@/types/Store";
import {
  Item,
  ItemsList,
  Key,
  LastPurchasedItem,
  LastPurchasedList,
  ShoppingItem,
  ShoppingList,
  StoreList,
} from "@/types/Item";
import { getEmptyObject, getKeyToUse } from "@/utils/helpers";

/**
 * {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
 * {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
 * {@link ListsState.shoppingList shoppingList} is the items currently being bought
 * {@link ListsState.stores stores} is a list of the stores created
 **/
export type ListsState = {
  itemsList: ItemsList;
  lastPurchasedList: LastPurchasedList;
  shoppingList: ShoppingList;
  storesList: StoreList;
};

const initialState: ListsState = {
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
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "Unable to add an item with no name and no upc to the itemsList."
        );
        return;
      }
      state.itemsList[keyToUse] = action.payload;
    },
    addLastPurchasedList: (
      state: ListsState,
      action: PayloadAction<LastPurchasedItem>
    ) => {
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "Unable to add an item with no name and no upc to the lastPurchasedList."
        );
        return;
      }
      state.lastPurchasedList[keyToUse] = action.payload;
    },
    addShoppingListItem: (
      state: ListsState,
      action: PayloadAction<ShoppingItem>
    ) => {
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "Unable to add an item with no name and no upc to the shoppingList."
        );
        return;
      }
      state.shoppingList[keyToUse] = action.payload;
    },
    addStoresListItem: (state: ListsState, action: PayloadAction<Store>) => {
      const keyToUse = getKeyToUse(action as PayloadAction<Key>);
      if (!keyToUse) {
        alert("Unable to add an item with no name to the storesList.");
        return;
      }
      state.storesList[keyToUse] = action.payload;
    },
    removeItemsListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the itemsList."
        );
        return;
      }
      delete state.itemsList[keyToUse];
    },
    removeLastPurchasedList: (
      state: ListsState,
      action: PayloadAction<Key>
    ) => {
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the lastPurchasedList."
        );
        return;
      }
      delete state.lastPurchasedList[keyToUse];
    },
    removeShoppingListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the shoppingList."
        );
        return;
      }
      delete state.shoppingList[keyToUse];
    },
    removeStoresListItem: (state: ListsState, action: PayloadAction<Key>) => {
      const keyToUse = getKeyToUse(action);
      if (!keyToUse) {
        alert(
          "A key must be provided in order to remove an item from the storesList."
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
} = listsSlice.actions;

export default listsSlice.reducer;

export const itemsListSelector = (state: RootState) =>
  (state[listsSlice.name] as ListsState).itemsList;
