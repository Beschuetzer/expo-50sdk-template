import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import {
  AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  AUTO_SET_STORE_WHEN_CLOSE_ENOUGH,
  IMAGE_PICKER_QUALITY_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD,
} from '@/constants/general';

type AutoSetStore = {
  enabled: boolean;
  maxDistanceInMiles: number;
};

export type OptionsState = {
  autoSetStore: AutoSetStore;
  customImageQuality: number;
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  autoSetStore: {
    enabled: AUTO_SET_STORE_WHEN_CLOSE_ENOUGH,
    maxDistanceInMiles: AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  },
  customImageQuality: IMAGE_PICKER_QUALITY_INITIAL,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD,
};

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setAutoSetStore: (
      state: OptionsState,
      action: PayloadAction<OptionsState['autoSetStore']>,
    ) => {
      state.autoSetStore = action.payload;
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
  setAutoSetStore,
  setSwipeableRowOpenThreshold,
  setCustomImageQuality,
} = optionsSlice.actions;

export const autoSetStoreSelector = (state: RootState) =>
  state[optionsSlice.name].autoSetStore;

export const customImageQualitySelector = (state: RootState) =>
  state[optionsSlice.name].customImageQuality;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
