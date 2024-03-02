import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import {
  AUTO_SET_STORE_WHEN_CLOSE_ENOUGH,
  IMAGE_PICKER_QUALITY_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD,
} from '@/constants/general';

export type OptionsState = {
  autoSetStoreWhenCloseEnough: boolean;
  customImageQuality: number;
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  autoSetStoreWhenCloseEnough: AUTO_SET_STORE_WHEN_CLOSE_ENOUGH,
  customImageQuality: IMAGE_PICKER_QUALITY_INITIAL,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD,
};

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setAutoSetStoreWhenCloseEnough: (
      state: OptionsState,
      action: PayloadAction<OptionsState['autoSetStoreWhenCloseEnough']>,
    ) => {
      state.autoSetStoreWhenCloseEnough = action.payload;
    },
    setCustomImageQuality: (
      state: OptionsState,
      action: PayloadAction<OptionsState['customImageQuality']>,
    ) => {
      if (!action.payload) return;
      state.customImageQuality = action.payload;
    },
    setSwipeableRowOpenThreshold: (
      state: OptionsState,
      action: PayloadAction<OptionsState['swipeableRowOpenThreshold']>,
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
export const {
  resetOptions,
  setAutoSetStoreWhenCloseEnough,
  setSwipeableRowOpenThreshold,
  setCustomImageQuality,
} = optionsSlice.actions;

export const autoSetStoreWhenCloseEnoughSelector = (state: RootState) =>
  state[optionsSlice.name].autoSetStoreWhenCloseEnough;

export const customImageQualitySelector = (state: RootState) =>
  state[optionsSlice.name].customImageQuality;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
