import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import {
  AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  AUTO_SET_STORE_WHEN_CLOSE_ENOUGH,
  CAN_OVERRIDE_DEFAULT,
  IMAGE_PICKER_QUALITY_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
} from '@/constants/general';
import { ScanningMode } from '@/types/general';

type AutoSetStore = {
  enabled: boolean;
  maxDistanceInMiles: number;
};

export type OptionsState = {
  autoSetStore: AutoSetStore;
  canOverrideItem: boolean;
  canOverrideStore: boolean;
  customImageQuality: number;
  scanningMode: ScanningMode;
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  autoSetStore: {
    enabled: AUTO_SET_STORE_WHEN_CLOSE_ENOUGH,
    maxDistanceInMiles: AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  },
  canOverrideItem: CAN_OVERRIDE_DEFAULT,
  canOverrideStore: CAN_OVERRIDE_DEFAULT,
  customImageQuality: IMAGE_PICKER_QUALITY_INITIAL,
  scanningMode: ScanningMode.AddToCart,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
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
    setCanOverrideItem: (
      state: OptionsState,
      action: PayloadAction<OptionsState['canOverrideItem']>,
    ) => {
      state.canOverrideItem = action.payload;
    },
    setCanOverrideStore: (
      state: OptionsState,
      action: PayloadAction<OptionsState['canOverrideStore']>,
    ) => {
      state.canOverrideStore = action.payload;
    },
    setCustomImageQuality: (
      state: OptionsState,
      action: PayloadAction<OptionsState['customImageQuality']>,
    ) => {
      if (!action.payload) return;
      state.customImageQuality = action.payload;
    },
    setScanningMode: (
      state: OptionsState,
      action: PayloadAction<OptionsState['scanningMode']>,
    ) => {
      if (!action.payload) return;
      state.scanningMode = action.payload;
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
  setCanOverrideItem,
  setCanOverrideStore,
  setScanningMode,
  setSwipeableRowOpenThreshold,
  setCustomImageQuality,
} = optionsSlice.actions;

export const autoSetStoreSelector = (state: RootState) =>
  state[optionsSlice.name].autoSetStore;

export const canOverrideItemSelector = (state: RootState) =>
  state[optionsSlice.name].canOverrideItem;

export const canOverrideStoreSelector = (state: RootState) =>
  state[optionsSlice.name].canOverrideStore;

export const customImageQualitySelector = (state: RootState) =>
  state[optionsSlice.name].customImageQuality;

export const scanningModeSelector = (state: RootState) =>
  state[optionsSlice.name].scanningMode;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
