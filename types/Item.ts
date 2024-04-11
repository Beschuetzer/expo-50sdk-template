import { XOR } from 'ts-xor';

import { Store } from './Store';

import { ListFilterFilters } from '@/components/lists/ListFilter';
import { ListName, SortOrderValue } from '@/state/slices/listsSlice';

export enum ItemUnit {
  Bar = 'bar',
  Bunch = 'bunch',
  Can = 'can',
  Case = 'case',
  Cups = 'c',
  Dozen = 'dozen',
  Each = 'ea',
  FluidOunce = 'fl oz',
  Gallon = 'gal',
  Jar = 'jar',
  Kilogram = 'kg',
  Ounce = 'oz',
  Package = 'package',
  Pint = 'pt',
  Pound = 'lb',
  Quart = 'qt',
  Tablespoon = 'tbsp',
  Teaspoon = 'tsp',
  Custom = 'Custom',
}

export type Key = XOR<
  {
    name: string;
    upc?: string;
  },
  {
    name?: string;
    upc: string;
  }
>;

export type ItemBase = {
  addedDate: number;
  /**
   *This is in milliseconds
   **/
  frequency?: number;
  fullscreenImage?: string;
  images: string[];
  imageToUseIndex: number;
  lastUpdatedDate: number;
  unit: string;
};

/**
 *This represents something that can be added to any store
 **/
export type Item = Key & ItemBase;
export type ItemWithStoreSpecificValues = Item & StoreSpecificValues;

export enum StoreSpecificValueKey {
  AisleNumber = 'aisleNumber',
  ItemId = 'itemId',
  Price = 'price',
  Quantity = 'quantity',
  IsInCart = 'isInCart',
}

/**
 *Maps the item key to the store specific values
 **/
export type StoreSpecificValuesMap = { [key: string]: StoreSpecificValues };
export type LastPurchasedMap = { [key: string]: StoreSpecificValue<number> };

/**
 *These are fields which vary based on the store
 **/
export type StoreSpecificValues = {
  [StoreSpecificValueKey.AisleNumber]: StoreSpecificValue<number>;
  [StoreSpecificValueKey.IsInCart]: StoreSpecificValue<boolean>;
  [StoreSpecificValueKey.ItemId]: StoreSpecificValue<string>;
  [StoreSpecificValueKey.Price]: StoreSpecificValue<number>;
  [StoreSpecificValueKey.Quantity]: StoreSpecificValue<number>;
} | null;

export type StoreSpecificValue<T> =
  | { [storeKey: string]: T }
  | null
  | undefined;
export type StoreSpecificValueUpdater = Partial<{
  [key in StoreSpecificValueKey]: (currentValue: any) => any;
}>;

export type LastPurchasedItem = Key & {
  lastPurchaseDate: number;
};

export type List<T> = {
  data: T[];
  sortOrderValue: SortOrderValue;
  filters: ListFilterFilters<T>;
};
export type ListFilters = { [key in ListName]: ListFilterFilters<any> };
export type ItemsList = List<Item>;
export type ShoppingList = List<ItemWithStoreSpecificValues>;
export type LastPurchasedList = List<LastPurchasedItem>;
export type StoreList = List<Store>;
