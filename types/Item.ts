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
  imageUri?: ItemImage;
  /**
   *This is in milliseconds
   **/
  frequency?: number;
};

/**
 *This is an item when it is in the shoppingList (and has a store associated with it)
 **/
export type ShoppingItem = {
  aisle: string;
  quantity: number;
  /**
   *Something like 'box', 'kg', or 'bottle'
   **/
  unit?: string;
} & Item;

export type LastPurchasedItem = Key & {
  lastPurchaseDate: number;
};

/**
 *{@link ItemImage.url url} is the url of an external image
 *{@link ItemImage.location location} is the location on the device for the image
 **/
export type ItemImage = XOR<
  {
    url: string;
    location?: string;
  },
  {
    location: string;
    url?: string;
  }
>;

type UpcOrName = string;
export type ItemsList = { [upcOrName: UpcOrName]: Item };
export type ShoppingList = { [upcOrName: UpcOrName]: ShoppingItem };
export type LastPurchasedList = { [upcOrName: UpcOrName]: LastPurchasedItem };
export type StoreList = { [name: string]: Store };
