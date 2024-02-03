import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Store } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  Item,
  ItemsList,
  LastPurchasedList,
  ShoppingItem,
  ShoppingList,
  StoreList,
} from "@/types/Item";
import { getEmptyArray, getEmptyObject } from "@/utils/helpers";

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
      const keyToUse = action?.payload?.upc || action?.payload?.name;
      if (!keyToUse) {
        alert("Unable to add an item with no name and no upc.");
        return;
      }
      state.itemsList[keyToUse] = action.payload;
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
  resetItemsList,
  resetLastPurchasedList,
  resetShoppingList,
  resetStoresList,
} = listsSlice.actions;

export default listsSlice.reducer;

export const itemsListSelector = (state: RootState) =>
  (state[listsSlice.name] as ListsState).itemsList;
