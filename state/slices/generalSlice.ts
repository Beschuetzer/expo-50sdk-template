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
   
  },
});

// Action creators are generated for each case reducer function
export const {
} = generalSlice.actions;

export default generalSlice.reducer;

