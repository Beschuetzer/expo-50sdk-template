import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type GeneralState = {
  lastUpcScanned: string;
};

const LAST_UPC_SCANNED_INITIAL = "";

const initialState: GeneralState = {
  lastUpcScanned: LAST_UPC_SCANNED_INITIAL,
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    resetLastUpcScanned: (state: GeneralState) => {
      state.lastUpcScanned = LAST_UPC_SCANNED_INITIAL;
    },
    setLastUpcScanned: (state: GeneralState, action: PayloadAction<string>) => {
      if (!action?.payload) return;
      state.lastUpcScanned = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { resetLastUpcScanned, setLastUpcScanned } = generalSlice.actions;

export default generalSlice.reducer;

export const lastUpcScannedSelector = (state: RootState) =>
  (state[generalSlice.name] as GeneralState).lastUpcScanned.trim();
