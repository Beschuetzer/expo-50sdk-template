import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import {
  AUTO_SAVE_INITIAL,
  CAN_OVERRIDE_DEFAULT,
  SAVE_IMAGES_TO_GALLERY_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
} from '@/constants/general';

export type OptionsState = {
  /**
   *When enabled, `TaskForm` auto-saves the task a short debounce after every edit instead of
   *requiring an explicit save action.
   **/
  autoSave: boolean;
  /**
   *When enabled, saving a task whose `_id` already exists overwrites it instead of creating a
   *duplicate (see `TaskForm`).
   **/
  canOverrideTask: boolean;
  /**
   *When enabled, photos captured/selected via `ImageCapturer` are also saved to the device's
   *photo gallery (see `SaveImagesToGalleryToggle`).
   **/
  saveImagesToGallery: boolean;
  swipeableRowOpenThreshold: number;
};

const initialState: OptionsState = {
  autoSave: AUTO_SAVE_INITIAL,
  canOverrideTask: CAN_OVERRIDE_DEFAULT,
  saveImagesToGallery: SAVE_IMAGES_TO_GALLERY_INITIAL,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT,
};

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setAutoSave: (
      state: OptionsState,
      action: PayloadAction<OptionsState['autoSave']>,
    ) => {
      state.autoSave = action.payload;
    },
    setCanOverrideTask: (
      state: OptionsState,
      action: PayloadAction<OptionsState['canOverrideTask']>,
    ) => {
      state.canOverrideTask = action.payload;
    },
    setSaveImagesToGallery: (
      state: OptionsState,
      action: PayloadAction<OptionsState['saveImagesToGallery']>,
    ) => {
      state.saveImagesToGallery = action.payload;
    },
    setSwipeableRowOpenThreshold: (
      state: OptionsState,
      action: PayloadAction<OptionsState['swipeableRowOpenThreshold']>,
    ) => {
      if (!action.payload) return;
      state.swipeableRowOpenThreshold = action.payload;
    },
    resetOptions: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  resetOptions,
  setAutoSave,
  setCanOverrideTask,
  setSaveImagesToGallery,
  setSwipeableRowOpenThreshold,
} = optionsSlice.actions;

export const autoSaveSelector = (state: RootState) =>
  state[optionsSlice.name].autoSave;

export const canOverrideTaskSelector = (state: RootState) =>
  state[optionsSlice.name].canOverrideTask;

export const saveImagesToGallerySelector = (state: RootState) =>
  state[optionsSlice.name].saveImagesToGallery;

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold;

export default optionsSlice.reducer;
