import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

import { UpcProduct } from '@/types/UpcResponse';
import { getKeyToUse } from '@/utils/helpers';

type Upc = string;
export type TimeStamp = {
  timestamp: number;
};
type UpcProducts = { [key: Upc]: UpcProduct & TimeStamp };
export type ScannerState = {
  upcProducts: UpcProducts;
};

const UPC_PRODUCTS_INITIAL = {} as UpcProducts;

const initialState: ScannerState = {
  upcProducts: UPC_PRODUCTS_INITIAL,
};

export const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    addUpcProduct: (state: ScannerState, action: PayloadAction<UpcProduct>) => {
      const keyToUse = getKeyToUse({
        name: action.payload.product_name,
        upc: action.payload.id || action.payload.code,
      });

      if (!action?.payload || !keyToUse) {
        alert(
          `Unable to add UpcProduct for ${JSON.stringify(
            action.payload,
            null,
            2,
          )}`,
        );
        return;
      }
      state.upcProducts[keyToUse] = {
        ...action.payload,
        timestamp: Date.now(),
      };
    },
    deleteUpcProduct: (state: ScannerState, action: PayloadAction<Upc>) => {
      if (!action?.payload) {
        alert(`Unable to dete UpcProduct for ${action.payload}`);
        return;
      }
      delete state.upcProducts[action.payload];
    },
    resetUpcProducts: (state: ScannerState) => {
      state.upcProducts = UPC_PRODUCTS_INITIAL;
    },
    setUpcProducts: (
      state: ScannerState,
      action: PayloadAction<UpcProducts>,
    ) => {
      if (!action.payload) return;
      state.upcProducts = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addUpcProduct,
  deleteUpcProduct,
  resetUpcProducts,
  setUpcProducts,
} = scannerSlice.actions;

export default scannerSlice.reducer;

export const upcProductsSelector = (state: RootState) =>
  (state[scannerSlice.name] as ScannerState).upcProducts;

export const upcProductSelector = (id: string) =>
  createSelector(
    [
      (state: RootState) =>
        (state[scannerSlice.name] as ScannerState).upcProducts,
    ],
    (upcProducts) => {
      const value = (upcProducts as any)?.[id];
      return value as UpcProduct;
    },
  );
