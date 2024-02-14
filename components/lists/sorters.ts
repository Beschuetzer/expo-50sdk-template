import {
  Item,
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item'
import { Store } from '@/types/Store'

export enum SortType {
  Aisle = 'Aisle in Current Store',
  DateAdded = 'Date Added',
  DateLastUpdated = 'Date Last Updated',
  Distance = 'Distance',
  Frequency = 'Frequency',
  ItemId = 'Item Id in Current Store',
  Name = 'Name',
  /**
   *This is effectively the order in which they were added
   **/
  None = 'When Added',
  Price = 'Price in Current Store',
  Quantity = 'Quantity in Current Store',
  Upc = 'Upc',
}

export type CompareFuntion = ((a: any, b: any) => number) | undefined
type HasAisleField = Pick<
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey.Aisle
>
type HasItemIdField = Pick<
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey.ItemId
>;
type HasPriceField = Pick<
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey.Price
>;
type HasQuantityField = Pick<
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey.Quantity
>;
type HasDateAddedField = Required<Pick<Item, 'addedDate'>>
type HasDateLastUpdatedField = Required<Pick<Item, 'lastUpdatedDate'>>
type HasFrequencyField = Required<Pick<Item, 'frequency'>>
type HasNameField = Required<Pick<Item, 'name'>>
type HasUpcField = Required<Pick<Item, 'upc'>>
type HasCalculatedDistanceField = Required<Pick<Store, 'calculatedDistance'>>

export const SORTERS: { [key in SortType]: CompareFuntion } = {
  [SortType.Aisle]: (current: HasAisleField, next: HasAisleField) => {
    if (!current.aisle && next.aisle) return 1;
    if (current.aisle && !next.aisle) return -1;
    if (current.aisle === next.aisle) return 0;
    if (current.aisle <= next.aisle) return -1;
    return 1;
  },
  [SortType.ItemId]: (current: HasItemIdField, next: HasItemIdField) => {
    if (!current.itemId && next.itemId) return 1;
    if (current.itemId && !next.itemId) return -1;
    if (current.itemId === next.itemId) return 0;
    if (current.itemId <= next.itemId) return -1;
    return 1;
  },
  [SortType.Quantity]: (current: HasQuantityField, next: HasQuantityField) => {
    if (!current.quantity && next.quantity) return 1;
    if (current.quantity && !next.quantity) return -1;
    if (current.quantity === next.quantity) return 0;
    if (current.quantity <= next.quantity) return -1;
    return 1;
  },
  [SortType.Price]: (current: HasPriceField, next: HasPriceField) => {
    if (!current.price && next.price) return 1;
    if (current.price && !next.price) return -1;
    if (current.price === next.price) return 0;
    if (current.price <= next.price) return -1;
    return 1;
  },
  [SortType.DateAdded]: (
    current: HasDateAddedField,
    next: HasDateAddedField,
  ) => {
    if (!current.addedDate && next.addedDate) return 1;
    if (current.addedDate && !next.addedDate) return -1;
    if (current.addedDate === next.addedDate) return 0;
    if (current && next && current.addedDate <= next.addedDate) return -1;
    return 1;
  },
  [SortType.DateLastUpdated]: (
    current: HasDateLastUpdatedField,
    next: HasDateLastUpdatedField,
  ) => {
    if (!current.lastUpdatedDate && next.lastUpdatedDate) return 1;
    if (current.lastUpdatedDate && !next.lastUpdatedDate) return -1;
    if (current.lastUpdatedDate === next.lastUpdatedDate) return 0;
    if (current && next && current.lastUpdatedDate <= next.lastUpdatedDate)
      return -1;
    return 1;
  },
  [SortType.Distance]: (
    current: HasCalculatedDistanceField,
    next: HasCalculatedDistanceField,
  ) => {
    if (!current.calculatedDistance && next.calculatedDistance) return 1;
    if (current.calculatedDistance && !next.calculatedDistance) return -1;
    if (current.calculatedDistance === next.calculatedDistance) return 0;
    if (
      current &&
      next &&
      current.calculatedDistance <= next.calculatedDistance
    )
      return -1;
    return 1;
  },
  [SortType.Frequency]: (
    current: HasFrequencyField,
    next: HasFrequencyField,
  ) => {
    if (!current.frequency && next.frequency) return 1;
    if (current.frequency && !next.frequency) return -1;
    if (current.frequency === next.frequency) return 0;
    if (current.frequency <= next.frequency) return -1;
    return 1;
  },
  [SortType.Name]: (current: HasNameField, next: HasNameField) => {
    if (!current.name && next.name) return 1;
    if (current.name && !next.name) return -1;
    if (current.name === next.name) return 0;
    if (current.name <= next.name) return -1;
    return 1;
  },
  [SortType.None]: (
    current: HasCalculatedDistanceField,
    next: HasCalculatedDistanceField,
  ) => {
    return 0;
  },
  [SortType.Upc]: (current: HasUpcField, next: HasUpcField) => {
    if (!current.upc && next.upc) return 1;
    if (current.upc && !next.upc) return -1;
    if (current.upc === next.upc) return 0;
    if (current.upc <= next.upc) return -1;
    return 1;
  },
};
