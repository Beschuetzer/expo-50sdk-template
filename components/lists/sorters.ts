import { EMPTY_STRING } from '@/constants/general';

/**
 *The string values have to match the field names for {@link ItemWithStoreSpecificValues}
 **/
export enum SortType {
  AisleNumber = 'aisleNumber',
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
  [SortType.AisleNumber]: 'Aisle # in Current Store',
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
  currentStoreId: string = EMPTY_STRING,
  direction: SortOrder = SortOrder.Ascending,
) {
  return (next: any, current: any) => {
    let currentItem = current[key];
    let nextItem = next[key];
    if (
      currentStoreId &&
      current?.[key]?.[currentStoreId] !== undefined &&
      next?.[key]?.[currentStoreId] !== undefined
    ) {
      currentItem = currentItem[currentStoreId];
      nextItem = nextItem[currentStoreId];
      if (
        key === SortType.AisleNumber ||
        key === SortType.ItemId ||
        key === SortType.Price ||
        key === SortType.Quantity
      ) {
        currentItem = parseFloat(currentItem);
        nextItem = parseFloat(nextItem);
      }
    }

    const isDescending = direction === SortOrder.Descending;
    if (!currentItem && nextItem) return isDescending ? 1 : -1;
    if (currentItem && !nextItem) return isDescending ? -1 : 1;
    if (currentItem === nextItem) return 0;
    if (currentItem < nextItem) return isDescending ? -1 : 1;
    return isDescending ? 1 : -1;
  };
}
