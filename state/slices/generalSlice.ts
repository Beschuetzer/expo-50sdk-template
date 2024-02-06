import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { UpcProduct } from "@/types/UpcResponse";
import { getEmptyObject } from "@/utils/helpers";

export type GeneralState = {
  lastUpcScanned: string;
  upcProductToDisplay: UpcProduct;
};

const LAST_UPC_SCANNED_INITIAL = "";

const initialState: GeneralState = {
  lastUpcScanned: LAST_UPC_SCANNED_INITIAL,
  upcProductToDisplay: getEmptyObject(),
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    resetUpcProductToDisplay: (state: GeneralState) => {
      state.upcProductToDisplay = getEmptyObject();
    },
    resetLastUpcScanned: (state: GeneralState) => {
      state.lastUpcScanned = LAST_UPC_SCANNED_INITIAL;
    },
    setUpcProductToDisplay: (
      state: GeneralState,
      action: PayloadAction<UpcProduct>,
    ) => {
      if (!action?.payload) return;
      state.upcProductToDisplay = action.payload;
    },
    setLastUpcScanned: (state: GeneralState, action: PayloadAction<string>) => {
      if (!action?.payload) return;
      state.lastUpcScanned = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetUpcProductToDisplay,
  resetLastUpcScanned,
  setUpcProductToDisplay,
  setLastUpcScanned,
} = generalSlice.actions;

export default generalSlice.reducer;

export const lastUpcScannedSelector = (state: RootState) =>
  (state[generalSlice.name] as GeneralState).lastUpcScanned.trim();

export const upcProductToDisplaySelector = (state: RootState) =>
  (state[generalSlice.name] as GeneralState).upcProductToDisplay;
