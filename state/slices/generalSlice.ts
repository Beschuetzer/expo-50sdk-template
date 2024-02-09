import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { EMPTY_STRING } from "@/constants/general";

export type GeneralState = {
  currentStore: string;
};

const initialState: GeneralState = {
  currentStore: EMPTY_STRING,
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setCurrentStore: (state: GeneralState, action: PayloadAction<string>) => {
      if (!action.payload) return;
      state.currentStore = action.payload;
    },
    resetCurrentStore: (state: GeneralState) => {
      state.currentStore = EMPTY_STRING;
    },
  },
});

// Action creators are generated for each case reducer function
export const { resetCurrentStore, setCurrentStore } = generalSlice.actions;

export const currentStoreSelector = (state: RootState) =>
  state[generalSlice.name].currentStore;

export default generalSlice.reducer;
