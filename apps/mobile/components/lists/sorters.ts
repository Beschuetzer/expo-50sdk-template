/**
 *The string values have to match the field names on {@link Task}.
 **/
export enum SortType {
  AddedDate = 'addedDate',
  DueDate = 'dueDate',
  LastUpdatedDate = 'lastUpdatedDate',
  None = 'none',
  Priority = 'priority',
  Title = 'title',
}

export enum SortOrder {
  Ascending = 'Ascending',
  Descending = 'Descending',
}

export const SORT_TYPE_DESCRIPTIONS: { [key in SortType]: string } = {
  [SortType.AddedDate]: 'Date Added',
  [SortType.DueDate]: 'Due Date',
  [SortType.LastUpdatedDate]: 'Date Last Updated',
  [SortType.None]: 'When Added',
  [SortType.Priority]: 'Priority',
  [SortType.Title]: 'Title',
};

export type SortOrderValue = {
  sortOrder: SortOrder;
  sortBy: SortType;
};

export type SetSortOrderPayload = SortOrderValue;

export type GetSorterInput = {
  isCaseSensitive?: boolean;
  sortOrder?: SortOrder;
  sortType: SortType;
};

export function getSorter({
  sortType,
  sortOrder: direction = SortOrder.Ascending,
  isCaseSensitive = false,
}: GetSorterInput) {
  return (next: any, current: any) => {
    let currentItem = typeof current === 'object' ? current[sortType] : current;
    let nextItem = typeof next === 'object' ? next[sortType] : next;

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
