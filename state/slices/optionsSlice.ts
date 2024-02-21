import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '../store'

import {
  IMAGE_PICKER_QUALITY_INITIAL,
  SWIPEABLE_ROW_OPEN_THRESHOLD,
} from '@/constants/general'

export type OptionsState = {
  customImageQuality: number
  swipeableRowOpenThreshold: number
}

const initialState: OptionsState = {
  customImageQuality: IMAGE_PICKER_QUALITY_INITIAL,
  swipeableRowOpenThreshold: SWIPEABLE_ROW_OPEN_THRESHOLD,
}

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setCustomImageQuality: (
      state: OptionsState,
      action: PayloadAction<OptionsState['customImageQuality']>,
    ) => {
      if (!action.payload) return
      state.customImageQuality = action.payload
    },
    setSwipeableRowOpenThreshold: (
      state: OptionsState,
      action: PayloadAction<OptionsState['swipeableRowOpenThreshold']>,
    ) => {
      if (!action.payload) return
      state.swipeableRowOpenThreshold = action.payload
    },
    resetOptions: (state: OptionsState) => {
      state = initialState
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  resetOptions,
  setSwipeableRowOpenThreshold,
  setCustomImageQuality,
} = optionsSlice.actions

export const customImageQualitySelector = (state: RootState) =>
  state[optionsSlice.name].customImageQuality

export const swipeableRowOpenThresholdSelector = (state: RootState) =>
  state[optionsSlice.name].swipeableRowOpenThreshold

export default optionsSlice.reducer
