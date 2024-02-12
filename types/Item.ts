import { XOR } from "ts-xor";

import { Store } from "./Store";

import { SortType } from "@/components/lists/sorters";

export enum ItemUnit {
  Bar = "bar",
  Bunch = "bunch",
  Can = "can",
  Case = "case",
  Cups = "c",
  Dozen = "dozen",
  Each = "ea",
  FluidOunce = "fl oz",
  Gallon = "gal",
  Jar = "jar",
  Kilogram = "kg",
  Ounce = "oz",
  Package = "package",
  Pint = "pt",
  Pound = "lb",
  Quart = "qt",
  Tablespoon = "tbsp",
  Teaspoon = "tsp",
  Custom = "Custom",
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

/**
 *This represents something that can be added to any store
 **/
export type Item = Key & {
  images: string[];
  imageToUseIndex: number;
  /**
   *This is in milliseconds
   **/
  frequency?: number;
  unit: string;
};

export type ItemWithStoreSpecificValues = Item & StoreSpecificValues;

export enum StoreSpecificValueKey {
  Aisle = "aisle",
  ItemId = "itemId",
  Price = "price",
  Quantity = "quantity",
}
/**
 *These are fields which vary based on the store
 **/
export type StoreSpecificValues = {
  [StoreSpecificValueKey.Aisle]: StoreSpecificValue<string>;
  [StoreSpecificValueKey.ItemId]: StoreSpecificValue<string>;
  [StoreSpecificValueKey.Price]: StoreSpecificValue<number>;
  [StoreSpecificValueKey.Quantity]: StoreSpecificValue<number>;
} | null;

export type StoreSpecificValue<T> = { [storeId: string]: T } | null | undefined;

export type LastPurchasedItem = Key & {
  lastPurchaseDate: number;
};

export type SortedList<T> = Partial<{ [key in SortType]: T[] }> & {
  currentSortType: SortType;
};
export type ItemsList = SortedList<ItemWithStoreSpecificValues>;
export type ShoppingList = SortedList<Item>;
export type LastPurchasedList = SortedList<LastPurchasedItem>;
export type StoreList = SortedList<Store>;
