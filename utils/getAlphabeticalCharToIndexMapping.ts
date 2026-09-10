import { getSorter, SortOrder, SortType } from '@/components/lists/sorters';
import { EMPTY_STRING } from '@/constants/general';
import { Key } from '@/types/Task';

export function getAlphabeticalCharToIndexMapping<T extends Key>(
  itemsRendered: T[],
  sortOrder: SortOrder = SortOrder.Ascending,
) {
  const letterStartToIndexMap: Record<string, number> = {};
  const sortedNames = [...itemsRendered]
    .sort(getSorter({ sortType: SortType.Title, sortOrder }))
    .map((item) => item.title?.toUpperCase() || EMPTY_STRING);

  for (let index = 0; index < sortedNames.length; index++) {
    const name = sortedNames[index];
    const firstChar = name[0];
    if (!firstChar || letterStartToIndexMap[firstChar] != null) continue;
    letterStartToIndexMap[firstChar] = index;
  }
  return letterStartToIndexMap;
}
