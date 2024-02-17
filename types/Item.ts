import { XOR } from 'ts-xor'

import { Store } from './Store'

import { ListFilterFilters } from '@/components/lists/ListFilter'
import { ListName } from '@/state/slices/listsSlice'

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
    name: string
    upc?: string
  },
  {
    name?: string
    upc: string
  }
>

export type ItemBase = {
  addedDate: number
  /**
   *This is in milliseconds
   **/
  frequency?: number
  images: string[]
  imageToUseIndex: number
  lastUpdatedDate: number
  unit: string
}

/**
 *This represents something that can be added to any store
 **/
export type Item = Key & ItemBase
export type ItemWithStoreSpecificValues = Item & StoreSpecificValues

export enum StoreSpecificValueKey {
  Aisle = 'aisle',
  ItemId = 'itemId',
  Price = 'price',
  Quantity = 'quantity',
}
/**
 *These are fields which vary based on the store
 **/
export type StoreSpecificValues = {
  [StoreSpecificValueKey.Aisle]: StoreSpecificValue<string>
  [StoreSpecificValueKey.ItemId]: StoreSpecificValue<string>
  [StoreSpecificValueKey.Price]: StoreSpecificValue<number>
  [StoreSpecificValueKey.Quantity]: StoreSpecificValue<number>
} | null

export type StoreSpecificValue<T> = { [storeId: string]: T } | null | undefined

export type LastPurchasedItem = Key & {
  lastPurchaseDate: number
}
export type ListFilters = { [key in ListName]: ListFilterFilters<any> }
export type ItemsList = ItemWithStoreSpecificValues[]
export type ShoppingList = ItemWithStoreSpecificValues[] //todo: this should be removed?
export type LastPurchasedList = LastPurchasedItem[]
export type StoreList = Store[]