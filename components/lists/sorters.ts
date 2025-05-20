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

export type GetSorterInput = {
  currentStoreId?: string;
  isCaseSensitive?: boolean;
  sortOrder?: SortOrder;
  sortType: SortType;
};

export function getSorter({
  sortType,
  currentStoreId = EMPTY_STRING,
  sortOrder: direction = SortOrder.Ascending,
  isCaseSensitive = false,
}: GetSorterInput) {
  return (next: any, current: any) => {
    let currentItem = typeof current === 'object' ? current[sortType] : current;
    let nextItem = typeof next === 'object' ? next[sortType] : next;
    if (
      currentStoreId &&
      current?.[sortType]?.[currentStoreId] !== undefined &&
      next?.[sortType]?.[currentStoreId] !== undefined
    ) {
      currentItem = currentItem[currentStoreId];
      nextItem = nextItem[currentStoreId];
      if (
        sortType === SortType.ItemId ||
        sortType === SortType.Price ||
        sortType === SortType.Quantity
      ) {
        currentItem = parseFloat(currentItem);
        nextItem = parseFloat(nextItem);
      } else if (sortType === SortType.AisleNumber) {
        //todo: need to use the custom sorter for the store
        // currentItem = currentItem?.replace(/[a-zA-Z]/g, EMPTY_STRING);
        // nextItem = nextItem?.replace(/[a-zA-Z]/g, EMPTY_STRING);
      }
    }

    const isDescending = direction === SortOrder.Descending;

    if (
      !isCaseSensitive &&
      typeof currentItem === 'string' &&
      typeof nextItem === 'string'
    ) {
      currentItem = currentItem?.toLowerCase();
      nextItem = nextItem?.toLowerCase();
    }

    if (!currentItem && nextItem) return isDescending ? 1 : -1;
    if (currentItem && !nextItem) return isDescending ? -1 : 1;
    if (currentItem === nextItem) return 0;
    if (currentItem < nextItem) return isDescending ? -1 : 1;
    return isDescending ? 1 : -1;
  };
}
