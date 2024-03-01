/**
 *The string values have to match the field names for {@link ItemWithStoreSpecificValues}
 **/
export enum SortType {
  Aisle = 'aisle',
  AddedDate = 'addedDate',
  LastUpdatedDate = 'lastUpdatedDate',
  Distance = 'calculatedDistance',
  Frequency = 'frequency',
  ItemId = 'itemId',
  Name = 'name',
  None = 'none',
  Price = 'price',
  Quantity = 'quantity',
  Upc = 'upc',
}

export enum SortOrder {
  Ascending = 'Ascending',
  Descending = 'Descending',
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
};

export function getSorter(
  key: SortType,
  currentStoreName: string,
  direction: SortOrder = SortOrder.Ascending,
) {
  return (next: any, current: any) => {
    let currentItem = current[key];
    let nextItem = next[key];
    if (
      current?.[key][currentStoreName] !== undefined &&
      next[key]?.[currentStoreName] !== undefined
    ) {
      currentItem = currentItem[currentStoreName];
      nextItem = nextItem[currentStoreName];
    }

    const isDescending = direction === SortOrder.Descending;
    if (!currentItem && nextItem) return isDescending ? 1 : -1;
    if (currentItem && !nextItem) return isDescending ? -1 : 1;
    if (currentItem === nextItem) return 0;
    if (currentItem <= nextItem) return isDescending ? -1 : 1;
    return isDescending ? 1 : -1;
  };
}
