import { XOR } from "ts-xor";

import { Store } from "./Store";

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

/**
 *This represents something that can be added to any store
 **/
export type Item = Key & {
  images: string[]
  imageToUseIndex: number
  /**
   *This is in milliseconds
   **/
  frequency?: number;
  unit: string;
}

export type ItemWithStoreSpecificValues = Item & StoreSpecificValues

/**
 *These are fields which vary based on the store
 **/
export type StoreSpecificValues = {
  aisle: StoreSpecificValue<string>;
  itemId: StoreSpecificValue<string>;
  price: StoreSpecificValue<number>;
  quantity: StoreSpecificValue<number>;
} | null;

export type StoreSpecificValue<T> = { [storeId: string]: T } | null | undefined;

export type LastPurchasedItem = Key & {
  lastPurchaseDate: number;
};

type UpcOrName = string;
type KeyedList<T> = { [upcOrName: UpcOrName]: T };
export type ItemsList = KeyedList<ItemWithStoreSpecificValues>;
export type ShoppingList = KeyedList<Item>;
export type LastPurchasedList = KeyedList<LastPurchasedItem>;
export type StoreList = { [name: string]: Store };
