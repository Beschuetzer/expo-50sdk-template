/**
 *The string values have to match the field names for {@link ItemWithStoreSpecificValues}
 **/
export enum SortType {
  Aisle = 'aisle',
  AddedDate = 'addedDate',
  LastUpdatedDate = 'lastUpdatedDate',
  Distance = 'distance',
  Frequency = 'frequency',
  ItemId = 'itemId',
  Name = 'name',
  None = 'none',
  Price = 'price',
  Quantity = 'quantity',
  Upc = 'upc',
}

export const SORT_TYPE_DESCRIPTIONS: { [key in SortType]: string } = {
  [SortType.Aisle]: 'Aisle in Current Store',
  [SortType.AddedDate]: 'Date Added',
  [SortType.LastUpdatedDate]: 'Date Last Updated',
  [SortType.Distance]: 'Distance',
  [SortType.Frequency]: 'Frequency',
  [SortType.ItemId]: 'Item Id in Current Store',
  [SortType.Name]: 'Name',
  [SortType.None]: 'When Added',
  [SortType.Price]: 'Price in Current Store',
  [SortType.Quantity]: 'Quantity in Current Store',
  [SortType.Upc]: 'Upc',
}

export function getSorter(
  key: SortType,
  direction: 'ascending' | 'descending' = 'ascending',
) {
  if (direction === 'descending') {
    return (next: any, current: any) => {
      if (!current[key] && next[key]) return 1
      if (current[key] && !next[key]) return -1
      if (current[key] === next[key]) return 0
      if (current[key] <= next[key]) return -1
      return 1
    }
  } else {
    return (next: any, current: any) => {
      if (!current[key] && next[key]) return -1
      if (current[key] && !next[key]) return 1
      if (current[key] === next[key]) return 0
      if (current[key] <= next[key]) return 1
      return -1
    }
  }
}
