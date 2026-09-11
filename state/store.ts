import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';

import generalReducer, {
  GeneralState,
  generalSlice,
} from '@/state/slices/generalSlice';
import optionsReducer, { optionsSlice } from '@/state/slices/optionsSlice';
import quickAddReducer, { quickAddSlice } from '@/state/slices/quickAddSlice';
import tasksReducer, { tasksSlice } from '@/state/slices/tasksSlice';

export const cleanPersistedGeneralState = (state?: Partial<GeneralState>) => ({
  account: state?.account,
  isUpToDate: state?.isUpToDate,
  lastSyncTime: state?.lastSyncTime,
  loadingMessage: state?.loadingMessage,
  shouldMockBffResponses: state?.shouldMockBffResponses,
  shouldSaveOnLogin: state?.shouldSaveOnLogin,
});

const generalPersistTransform = {
  in: (state: Partial<GeneralState> | undefined) =>
    cleanPersistedGeneralState(state),
  out: (state: Partial<GeneralState> | undefined) =>
    cleanPersistedGeneralState(state),
};

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  whitelist: [
    generalSlice.name,
    optionsSlice.name,
    quickAddSlice.name,
    tasksSlice.name,
  ],
  transforms: [generalPersistTransform],
  serialize: true,
  writeFailHandler: (error: Error) => {
    console.warn('Redux persist write failed:', error);
  },
  debug: false,
  throttle: 200,
};

const rootReducer = combineReducers({
  [generalSlice.name]: generalReducer,
  [optionsSlice.name]: optionsReducer,
  [quickAddSlice.name]: quickAddReducer,
  [tasksSlice.name]: tasksReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const REDUX_PERSIST_IGNORE_ACTIONS = [
  'persist/FLUSH',
  'persist/PAUSE',
  'persist/PERSIST',
  'persist/PURGE',
  'persist/REGISTER',
  'persist/REHYDRATE',
];

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: REDUX_PERSIST_IGNORE_ACTIONS,
      },
    });
  },
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// app/hooks.ts

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
