import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import {
  EMPTY_STRING,
  SWIPEABLE_ROW_OPEN_THRESHOLD,
} from "@/constants/general";

export type OptionsState = {
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD,
};

export const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    setSwipeableRowOpenThreshold: (
      state: OptionsState,
      action: PayloadAction<OptionsState["swipeableRowOpenThreshold"]>,
    ) => {
      if (!action.payload) return;
      state.swipeableRowOpenThreshold = action.payload;
    },
    resetOptions: (state: OptionsState) => {
      state = initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const { resetOptions, setSwipeableRowOpenThreshold } =
  optionsSlice.actions;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
