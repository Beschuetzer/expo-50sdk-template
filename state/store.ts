import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';

import generalReducer, { generalSlice } from '@/state/slices/generalSlice';
import listsReducer, { listsSlice } from '@/state/slices/listsSlice';
import optionsReducer, { optionsSlice } from '@/state/slices/optionsSlice';
import scannerReducer, { scannerSlice } from '@/state/slices/scannerSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  [generalSlice.name]: persistReducer(persistConfig, generalReducer),
  [scannerSlice.name]: persistReducer(persistConfig, scannerReducer),
  [listsSlice.name]: persistReducer(persistConfig, listsReducer),
  [optionsSlice.name]: persistReducer(persistConfig, optionsReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
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
