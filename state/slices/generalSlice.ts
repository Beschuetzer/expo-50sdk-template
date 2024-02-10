import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { GpsCoordinate } from "@/types/Store";

const CURRENT_LOCATION_INITIAL = null;

export type GeneralState = {
  currentLocation: GpsCoordinate | null;
};

const initialState: GeneralState = {
  currentLocation: CURRENT_LOCATION_INITIAL,
};

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setCurrentLocation: (
      state: GeneralState,
      action: PayloadAction<GpsCoordinate>,
    ) => {
      if (!action.payload) return
      state.currentLocation = action.payload
    },
    resetCurrentLocation: (state: GeneralState) => {
      state.currentLocation = CURRENT_LOCATION_INITIAL
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  resetCurrentLocation,
  setCurrentLocation,
} = generalSlice.actions;

export const currentLocationSelector = (state: RootState) =>
  state[generalSlice.name].currentLocation

export default generalSlice.reducer;
