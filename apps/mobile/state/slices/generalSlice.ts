import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../store';

import { EMPTY_NUMBER, EMPTY_STRING } from '@/constants/general';
import { UserAccount } from '@/types/bffService';
import { Error } from '@/types/general';
import { ArrayElement } from '@/types/helpers';

//#region Defaults
export const ACCOUNT_INITIAL = Object.freeze({
  email: EMPTY_STRING,
  password: EMPTY_STRING,
  _id: EMPTY_STRING,
});
export const ERRORS_INITIAL = (() => [] as Error[])();
export const IS_UP_TO_DATE_INITIAL = false;
export const SHOULD_MOCK_BFF_RESPONSES_INITIAL = false;
export const SHOULD_SAVE_ON_LOGIN_INITIAL = false;
//#endregion

export type GeneralState = {
  account: UserAccount;
  errors: Error[];
  /**
   *Tracks whether the local state needs to be synced with the db
   **/
  isUpToDate: boolean;
  /**
   *Last time POST /user/saveAll was successfully called
   **/
  lastSyncTime: number;
  /**
   *LoadingModal listen for changes here and displays them
   **/
  loadingMessage: string;
  /**
   *Dev-only: have `BffService` return canned data instead of hitting the network
   *(see `MockResponseToggle`).
   **/
  shouldMockBffResponses: boolean;
  /**
   *This will call the {@link BffService.saveAllToDb} method on login if `true`.
   **/
  shouldSaveOnLogin: boolean;
};

const initialState: GeneralState = {
  account: ACCOUNT_INITIAL,
  errors: ERRORS_INITIAL,
  isUpToDate: IS_UP_TO_DATE_INITIAL,
  lastSyncTime: EMPTY_NUMBER,
  loadingMessage: EMPTY_STRING,
  shouldMockBffResponses: SHOULD_MOCK_BFF_RESPONSES_INITIAL,
  shouldSaveOnLogin: SHOULD_SAVE_ON_LOGIN_INITIAL,
};

const normalizeError = (value: unknown): Error | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Error>;
  const message =
    typeof candidate.message === 'string' && candidate.message.trim().length > 0
      ? candidate.message
      : 'Unknown error';

  return {
    message,
    statusCode:
      typeof candidate.statusCode === 'number'
        ? candidate.statusCode
        : undefined,
    stack: typeof candidate.stack === 'string' ? candidate.stack : undefined,
    name: typeof candidate.name === 'string' ? candidate.name : undefined,
    code:
      typeof candidate.code === 'string' || typeof candidate.code === 'number'
        ? candidate.code
        : undefined,
    error:
      candidate.error && typeof candidate.error === 'object'
        ? {
            message:
              typeof candidate.error.message === 'string'
                ? candidate.error.message
                : undefined,
            stack:
              typeof candidate.error.stack === 'string'
                ? candidate.error.stack
                : undefined,
            name:
              typeof candidate.error.name === 'string'
                ? candidate.error.name
                : undefined,
            code:
              typeof candidate.error.code === 'string' ||
              typeof candidate.error.code === 'number'
                ? candidate.error.code
                : undefined,
          }
        : undefined,
  };
};

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    resetErrors: (state: GeneralState) => {
      state.errors = ERRORS_INITIAL;
    },
    setAccount: (
      state: GeneralState,
      action: PayloadAction<GeneralState['account']>,
    ) => {
      const account = action.payload;
      if (!account) {
        return;
      }
      state.account = account;
    },
    setIsUpToDate: (
      state: GeneralState,
      action: PayloadAction<GeneralState['isUpToDate']>,
    ) => {
      state.isUpToDate = action.payload;
    },
    setError: (
      state: GeneralState,
      action: PayloadAction<ArrayElement<GeneralState['errors']>>,
    ) => {
      const error = normalizeError(action.payload);
      if (!error || !error.message) {
        return;
      }
      const currentErrors = Array.isArray(state.errors) ? state.errors : [];
      state.errors = [...currentErrors, error];
    },
    setErrors: (
      state: GeneralState,
      action: PayloadAction<GeneralState['errors']>,
    ) => {
      const currentErrors = Array.isArray(state.errors) ? state.errors : [];
      const errors = (action.payload || [])
        .map((error) => normalizeError(error))
        .filter(Boolean) as Error[];
      if (errors.length === 0) {
        state.errors = ERRORS_INITIAL;
        return;
      }
      state.errors = [...currentErrors, ...errors];
    },
    setLoading: (
      state: GeneralState,
      action: PayloadAction<GeneralState['loadingMessage']>,
    ) => {
      state.loadingMessage = action.payload;
    },
    setShouldSaveOnLogin: (
      state: GeneralState,
      action: PayloadAction<GeneralState['shouldSaveOnLogin']>,
    ) => {
      const shouldSave =
        action.payload != null && state?.account._id ? action.payload : false;
      state.shouldSaveOnLogin = shouldSave;
    },
    toggleShouldMockBffResponses: (state: GeneralState) => {
      state.shouldMockBffResponses = !state.shouldMockBffResponses;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === 'deleteTasks/rejected',
      (state) => {
        state.isUpToDate = false;
      },
    );
    builder.addMatcher(
      (action) =>
        action.type === 'loadAll/fulfilled' ||
        action.type === 'saveAll/fulfilled',
      (state) => {
        state.isUpToDate = true;
        state.lastSyncTime = Date.now();
      },
    );
    builder.addMatcher(
      (action) =>
        action.type === 'saveAll/rejected' ||
        action.type === 'saveTask/rejected' ||
        action.type === 'saveTasks/rejected',
      (state) => {
        state.isUpToDate = false;
      },
    );
  },
});

// Action creators are generated for each case reducer function
export const {
  resetErrors,
  setAccount,
  setIsUpToDate,
  setError,
  setErrors,
  setLoading,
  setShouldSaveOnLogin,
  toggleShouldMockBffResponses,
} = generalSlice.actions;

export default generalSlice.reducer;

export const shouldMockBffResponsesSelector = (state: RootState) =>
  state[generalSlice.name].shouldMockBffResponses;

export const accountSelector = (state: RootState) =>
  state[generalSlice.name].account;

export const errorSelector = (state: RootState) =>
  state[generalSlice.name].errors;

export const isUpToDateSelector = (state: RootState) =>
  state[generalSlice.name].isUpToDate;

export const loadingSelector = (state: RootState) =>
  state[generalSlice.name].loadingMessage;

export const shouldSaveOnLoginSelector = (state: RootState) =>
  state[generalSlice.name].shouldSaveOnLogin;
