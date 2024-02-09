import { XOR } from "ts-xor";

import { Store } from "./Store";

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
} & StoreSpecificValues;

/**
 *These are fields which vary based on the store
 **/
type StoreSpecificValues = {
  aisle: StoreSpecificValue<string>;
  itemId: StoreSpecificValue<string>;
  price: StoreSpecificValue<number>;
  quantity: StoreSpecificValue<number>;
  unit: StoreSpecificValue<string>;
};

export type StoreSpecificValue<T> = { [storeId: string]: T };

export type LastPurchasedItem = Key & {
  lastPurchaseDate: number;
};

type UpcOrName = string;
type KeyedList<T> = { [upcOrName: UpcOrName]: T };
export type ItemsList = KeyedList<Item>;
export type ShoppingList = KeyedList<Item>;
export type LastPurchasedList = KeyedList<LastPurchasedItem>;
export type StoreList = { [name: string]: Store };
