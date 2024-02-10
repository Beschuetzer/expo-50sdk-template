import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { EMPTY_STRING } from "@/constants/general";
import { GpsCoordinate } from "@/types/Store";

const CURRENT_LOCATION_INITIAL = null;

export type GeneralState = {
  currentStore: string;
  currentLocation: GpsCoordinate | null;
};

const initialState: GeneralState = {
  currentStore: EMPTY_STRING,
  currentLocation: CURRENT_LOCATION_INITIAL,
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setCurrentLocation: (
      state: GeneralState,
      action: PayloadAction<GpsCoordinate>,
    ) => {
      if (!action.payload) return;
      state.currentLocation = action.payload;
    },
    setCurrentStore: (state: GeneralState, action: PayloadAction<string>) => {
      if (!action.payload) return;
      state.currentStore = action.payload;
    },
    resetCurrentLocation: (state: GeneralState) => {
      state.currentLocation = CURRENT_LOCATION_INITIAL;
    },
    resetCurrentStore: (state: GeneralState) => {
      state.currentStore = EMPTY_STRING;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetCurrentLocation,
  resetCurrentStore,
  setCurrentLocation,
  setCurrentStore,
} = generalSlice.actions;

export const currentLocationSelector = (state: RootState) =>
  state[generalSlice.name].currentLocation

export const currentStoreSelector = (state: RootState) =>
  state[generalSlice.name].currentStore;

export default generalSlice.reducer;
