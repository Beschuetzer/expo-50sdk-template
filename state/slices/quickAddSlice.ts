import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import { getQuickAddGuesses } from './helpers/getQuickAddGuesses';
import { listsSlice } from './listsSlice';
import { RootState } from '../store';
import { convertImageToList } from '../thunks';

import { EMPTY_STRING } from '@/constants/general';
import { ProcessedGroceryList } from '@/types/bffService';
import { ListName } from '@/types/listSlice';
import {
  QuickAddMode,
  QuickAddState,
  ProcessedGroceryListWithGuesses,
} from '@/types/quickAdd';

//#region Defaults
export const QUICK_ADD_ITEMS_INITIAL = Object.freeze({
  store: EMPTY_STRING,
  items: [],
});
export const QUICK_ADD_MODE_INITIAL: QuickAddMode = 'replace';
export const QUICK_ADD_UNIT_INITIAL = 'unit';
//#endregion

const initialState: QuickAddState = Object.freeze({
  quickAddList: QUICK_ADD_ITEMS_INITIAL,
  mode: QUICK_ADD_MODE_INITIAL,
});

export const quickAddSlice = createSlice({
  name: 'quickAdd',
  initialState,
  reducers: {
    addToQuickAddList: (
      state: QuickAddState,
      action: PayloadAction<Pick<QuickAddState['quickAddList'], 'items'>>,
    ) => {
      const { items } = action.payload;
      if (!items || items.length === 0) return;
      state.quickAddList.items.unshift(...items);
    },
    clearQuickAddList: (state: QuickAddState) => {
      state.quickAddList = QUICK_ADD_ITEMS_INITIAL;
    },
    deleteQuickAddListItem: (
      state: QuickAddState,
      action: PayloadAction<number>,
    ) => {
      const index = action.payload;
      if (index > state.quickAddList.items.length - 1 || index < 0) {
        return;
      }

      const copy = [...state.quickAddList.items];
      copy.splice(index, 1);
      state.quickAddList.items = copy;
    },
    resetQuickAddListSlice: (state: QuickAddState) => {
      state = initialState;
    },
    setQuickAddList: (
      state: QuickAddState,
      action: PayloadAction<QuickAddState['quickAddList']>,
    ) => {
      state.quickAddList = action.payload || QUICK_ADD_ITEMS_INITIAL;
    },
    toggleQuickAddMode: (state: QuickAddState) => {
      state.mode = state.mode === 'replace' ? 'append' : 'replace';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(convertImageToList.fulfilled, (state, action) => {
      if (
        state.mode === 'append' &&
        (action.payload as ProcessedGroceryList)?.items?.length > 0
      ) {
        state.quickAddList.items = [
          ...state.quickAddList.items,
          ...(action.payload as ProcessedGroceryList).items,
        ];
      } else {
        state.quickAddList = action.payload || QUICK_ADD_ITEMS_INITIAL;
      }
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  addToQuickAddList,
  clearQuickAddList,
  deleteQuickAddListItem,
  resetQuickAddListSlice,
  setQuickAddList,
  toggleQuickAddMode,
} = quickAddSlice.actions;

export default quickAddSlice.reducer;

export const quickAddListSelector = (state: RootState) =>
  state[quickAddSlice.name].quickAddList;

export const quickAddModeSelector = (state: RootState) =>
  state[quickAddSlice.name].mode;

export const quickAddListWithGuessesSelector = createSelector(
  [
    (state: RootState) => state[quickAddSlice.name].quickAddList,
    (state: RootState) => state[listsSlice.name][ListName.ItemsList].data,
    (state: RootState) => state[listsSlice.name][ListName.StoresList].data,
    (state: RootState) => state[listsSlice.name].currentStoreId,
  ],
  (quickAddList, itemsList, storesList, currentStoreId) => {
    // const currentStoreName = getItemFromList(storesList, currentStoreId);
    if (!quickAddList.items || quickAddList.items.length === 0) {
      return {
        ...QUICK_ADD_ITEMS_INITIAL,
        guesses: {},
      } as ProcessedGroceryListWithGuesses;
    }

    return {
      ...quickAddList,
      guesses: getQuickAddGuesses(itemsList, quickAddList),
    } as ProcessedGroceryListWithGuesses;
  },
);
