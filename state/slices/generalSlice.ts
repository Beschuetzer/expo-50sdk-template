import { createSlice } from '@reduxjs/toolkit'

import { RootState } from '../store'

const SHOULD_MOCK_SCANNED_RESPONSES = false

export type GeneralState = {
  shouldMockScannedResponses: boolean
}

const initialState: GeneralState = {
  shouldMockScannedResponses: SHOULD_MOCK_SCANNED_RESPONSES,
}

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    toggleShouldShouldMockScannedResponses: (state: GeneralState) => {
      state.shouldMockScannedResponses = !state.shouldMockScannedResponses
    },
  },
})

// Action creators are generated for each case reducer function
export const { toggleShouldShouldMockScannedResponses } = generalSlice.actions

export default generalSlice.reducer

export const shouldShouldMockScannedResponsesSelector = (state: RootState) =>
  state[generalSlice.name].shouldMockScannedResponses
