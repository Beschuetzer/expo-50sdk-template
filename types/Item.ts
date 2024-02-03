import { XOR } from "ts-xor";
import { Store } from "./Store";

/**
*This represents something that can be added to any store
**/
export type Item = XOR<
  {
    name: string;
    upc?: string;
  },
  {
    name?: string;
    upc: string;
  }
> & {
  image?: string;
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

type UpcOrName = string;
export type ItemsList = { [upcOrName: UpcOrName]: Item };
export type ShoppingList = { [upcOrName: UpcOrName]: ShoppingItem };
export type LastPurchasedList = { [upcOrName: UpcOrName]: number };
export type StoreList = { [name: string]: Store };