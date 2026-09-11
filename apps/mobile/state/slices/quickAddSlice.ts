import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import { tasksSlice } from './tasksSlice';
import { RootState } from '../store';

import { getBulkAddGuesses } from '@/state/slices/helpers/getQuickAddGuesses';
import { BulkAddList, BulkAddMode, BulkAddState } from '@/types/quickAdd';

//#region Defaults
export const BULK_ADD_LIST_INITIAL: BulkAddList = Object.freeze({
  drafts: [],
});
export const BULK_ADD_MODE_INITIAL: BulkAddMode = 'replace';
//#endregion

const initialState: BulkAddState = Object.freeze({
  bulkAddList: BULK_ADD_LIST_INITIAL,
  mode: BULK_ADD_MODE_INITIAL,
});

export const quickAddSlice = createSlice({
  name: 'quickAdd',
  initialState,
  reducers: {
    setBulkAddDrafts: (
      state: BulkAddState,
      action: PayloadAction<BulkAddList['drafts']>,
    ) => {
      state.bulkAddList.drafts = action.payload || [];
    },
    clearBulkAddList: (state: BulkAddState) => {
      state.bulkAddList = BULK_ADD_LIST_INITIAL;
    },
    removeBulkAddDraft: (
      state: BulkAddState,
      action: PayloadAction<number>,
    ) => {
      const index = action.payload;
      if (index > state.bulkAddList.drafts.length - 1 || index < 0) {
        return;
      }
      const copy = [...state.bulkAddList.drafts];
      copy.splice(index, 1);
      state.bulkAddList.drafts = copy;
    },
    toggleBulkAddMode: (state: BulkAddState) => {
      state.mode = state.mode === 'replace' ? 'append' : 'replace';
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  clearBulkAddList,
  removeBulkAddDraft,
  setBulkAddDrafts,
  toggleBulkAddMode,
} = quickAddSlice.actions;

export default quickAddSlice.reducer;

export const bulkAddListSelector = (state: RootState) =>
  state[quickAddSlice.name].bulkAddList;

export const bulkAddModeSelector = (state: RootState) =>
  state[quickAddSlice.name].mode;

export const bulkAddGuessesSelector = createSelector(
  [
    (state: RootState) => state[quickAddSlice.name].bulkAddList,
    (state: RootState) => state[tasksSlice.name].data,
  ],
  (bulkAddList, tasks) => {
    if (!bulkAddList.drafts || bulkAddList.drafts.length === 0) {
      return {};
    }
    return getBulkAddGuesses(tasks, bulkAddList);
  },
);
