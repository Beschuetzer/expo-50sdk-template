import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Store } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Item, ShoppingItem } from "@/types/Item";


/**
* {@link ListsState.itemsList itemsList} has all of the items that have been scanned (these can be added to any store)
* {@link ListsState.lastPurchasedList lastPurchasedList} keeps track of the last time the upc was purchased
* {@link ListsState.shoppingList shoppingList} is the items currently being bought
* {@link ListsState.stores stores} is a list of the stores created
**/
export type ListsState = {
  itemsList: Item[];
  lastPurchasedList: {[upcCode: string]: number}
  shoppingList: ShoppingItem[],
  storesList: Store[]
};

// const LAST_UPC_SCANNED_INITIAL = "";

// const initialState: ListsState = {
//   lastUpcScanned: LAST_UPC_SCANNED_INITIAL,
// };

// export const generalSlice = createSlice({
//   name: "general",
//   initialState,
//   reducers: {
//     resetLastUpcScanned: (state: ListsState) => {
//       state.lastUpcScanned = LAST_UPC_SCANNED_INITIAL;
//     },
//     setLastUpcScanned: (state: ListsState, action: PayloadAction<string>) => {
//       if (!action?.payload) return;
//       state.lastUpcScanned = action.payload;
//     },
//   },
// });

// // Action creators are generated for each case reducer function
// export const { resetLastUpcScanned, setLastUpcScanned } = generalSlice.actions;

// export default generalSlice.reducer;

// export const lastUpcScannedSelector = (state: RootState) =>
//   (state[generalSlice.name] as ListsState).lastUpcScanned?.trim();
