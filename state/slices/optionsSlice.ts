import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import {
  AUTO_SAVE_STORES_INITIAL,
  AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  AUTO_SET_STORE_WHEN_CLOSE_ENOUGH_INITIAL,
  CAN_OVERRIDE_DEFAULT,
  IMAGE_PICKER_QUALITY_INITIAL,
  NAME_ORDER_TEMPLATE_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
} from '@/constants/general';
import { ScanningMode } from '@/types/general';

type AutoSetStore = {
  enabled: boolean;
  maxDistanceInMiles: number;
};

export type OptionsState = {
  autoSaveStores: boolean;
  autoSetStore: AutoSetStore;
  canOverrideItem: boolean;
  canOverrideStore: boolean;
  customImageQuality: number;
  nameOrderTemplate: string;
  scanningMode: ScanningMode;
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  autoSaveStores: AUTO_SAVE_STORES_INITIAL,
  autoSetStore: {
    enabled: AUTO_SET_STORE_WHEN_CLOSE_ENOUGH_INITIAL,
    maxDistanceInMiles: AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  },
  canOverrideItem: CAN_OVERRIDE_DEFAULT,
  canOverrideStore: CAN_OVERRIDE_DEFAULT,
  customImageQuality: IMAGE_PICKER_QUALITY_INITIAL,
  nameOrderTemplate: NAME_ORDER_TEMPLATE_INITIAL,
  scanningMode: ScanningMode.AddToCart,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
};

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setAutoSaveStores: (
      state: OptionsState,
      action: PayloadAction<OptionsState['autoSaveStores']>,
    ) => {
      state.autoSaveStores = action.payload;
    },
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
    setNameOrderTemplate: (
      state: OptionsState,
      action: PayloadAction<OptionsState['nameOrderTemplate']>,
    ) => {
      state.nameOrderTemplate = action?.payload || NAME_ORDER_TEMPLATE_INITIAL;
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
  setAutoSaveStores,
  setAutoSetStore,
  setCanOverrideItem,
  setCanOverrideStore,
  setNameOrderTemplate,
  setScanningMode,
  setSwipeableRowOpenThreshold,
  setCustomImageQuality,
} = optionsSlice.actions;

export const autoSaveStoresSelector = (state: RootState) =>
  state[optionsSlice.name].autoSaveStores;

export const autoSetStoreSelector = (state: RootState) =>
  state[optionsSlice.name].autoSetStore;

export const canOverrideItemSelector = (state: RootState) =>
  state[optionsSlice.name].canOverrideItem;

export const canOverrideStoreSelector = (state: RootState) =>
  state[optionsSlice.name].canOverrideStore;

export const customImageQualitySelector = (state: RootState) =>
  state[optionsSlice.name].customImageQuality;

export const nameOrderTemplateSelector = (state: RootState) =>
  state[optionsSlice.name].nameOrderTemplate;

export const scanningModeSelector = (state: RootState) =>
  state[optionsSlice.name].scanningMode;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
