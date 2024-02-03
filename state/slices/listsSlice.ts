import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Store } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Item, ShoppingItem } from "@/types/Item";
import { getEmptyArray, getEmptyObject } from "@/utils/helpers";

/**
 * {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
 * {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
 * {@link ListsState.shoppingList shoppingList} is the items currently being bought
 * {@link ListsState.stores stores} is a list of the stores created
 **/
export type ListsState = {
  itemsList: Item[];
  lastPurchasedList: { [upcCode: string]: number };
  shoppingList: ShoppingItem[];
  storesList: Store[];
};

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const initialState: ListsState = {
  itemsList: getEmptyArray(),
  lastPurchasedList: getEmptyObject(),
  shoppingList: getEmptyArray(),
  storesList: getEmptyArray(),
};

export const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    resetItemsList: (state: ListsState) => {
      state.itemsList = getEmptyArray();
    },
    resetLastPurchasedList: (state: ListsState) => {
      state.lastPurchasedList = getEmptyObject();
    },
    resetShoppingList: (state: ListsState) => {
      state.shoppingList = getEmptyArray();
    },
    resetStoresList: (state: ListsState) => {
      state.storesList = getEmptyArray();
    },
  },
});

// Action creators are generated for each case reducer function
export const { 
    resetItemsList,
    resetLastPurchasedList,
    resetShoppingList,
    resetStoresList
 } = listsSlice.actions;

export default listsSlice.reducer;

export const itemsListSelector = (state: RootState) =>
  (state[listsSlice.name] as ListsState).itemsList;
