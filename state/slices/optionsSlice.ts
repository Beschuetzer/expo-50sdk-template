import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import {
  AUTO_SAVE_ITEMS_INITIAL,
  AUTO_SAVE_STORES_INITIAL,
  AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  AUTO_SET_STORE_WHEN_CLOSE_ENOUGH_INITIAL,
  CAN_OVERRIDE_DEFAULT,
  NAME_ORDER_TEMPLATE_INITIAL,
  SAVE_IMAGES_TO_GALLERY_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
} from '@/constants/general';
import { ScanningMode } from '@/types/general';

type AutoSetStore = {
  enabled: boolean;
  maxDistanceInMiles: number;
};

export type OptionsState = {
  autoSaveItems: boolean;
  autoSaveStores: boolean;
  autoSetStore: AutoSetStore;
  canOverrideItem: boolean;
  saveImagesToGallery: boolean;
  nameOrderTemplate: string;
  scanningMode: ScanningMode;
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  autoSaveItems: AUTO_SAVE_ITEMS_INITIAL,
  autoSaveStores: AUTO_SAVE_STORES_INITIAL,
  autoSetStore: {
    enabled: AUTO_SET_STORE_WHEN_CLOSE_ENOUGH_INITIAL,
    maxDistanceInMiles: AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL,
  },
  canOverrideItem: CAN_OVERRIDE_DEFAULT,
  nameOrderTemplate: NAME_ORDER_TEMPLATE_INITIAL,
  saveImagesToGallery: SAVE_IMAGES_TO_GALLERY_INITIAL,
  scanningMode: ScanningMode.AddToCart,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
};

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setAutoSaveItems: (
      state: OptionsState,
      action: PayloadAction<OptionsState['autoSaveItems']>,
    ) => {
      state.autoSaveItems = action.payload;
    },
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
    setSaveImagesToGallery: (
      state: OptionsState,
      action: PayloadAction<OptionsState['saveImagesToGallery']>,
    ) => {
      state.saveImagesToGallery = action.payload;
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
  setAutoSaveItems,
  setAutoSaveStores,
  setAutoSetStore,
  setCanOverrideItem,
  setSaveImagesToGallery,
  setNameOrderTemplate,
  setScanningMode,
  setSwipeableRowOpenThreshold,
} = optionsSlice.actions;

export const autoSaveItemsSelector = (state: RootState) =>
  state[optionsSlice.name].autoSaveItems;

export const autoSaveStoresSelector = (state: RootState) =>
  state[optionsSlice.name].autoSaveStores;

export const autoSetStoreSelector = (state: RootState) =>
  state[optionsSlice.name].autoSetStore;

export const canOverrideItemSelector = (state: RootState) =>
  state[optionsSlice.name].canOverrideItem;

export const nameOrderTemplateSelector = (state: RootState) =>
  state[optionsSlice.name].nameOrderTemplate;

export const saveImagesToGallerySelector = (state: RootState) =>
  state[optionsSlice.name].saveImagesToGallery;

export const scanningModeSelector = (state: RootState) =>
  state[optionsSlice.name].scanningMode;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
