import { EMPTY_STRING } from '@/constants/general';
import { Key } from '@/types/Item';

export function getAlphabeticalCharToIndexMapping<T extends Key>(
  itemsRendered: T[],
  sortOrder: 'ascending' | 'descending' = 'ascending',
) {
  const letterStartToIndexMap: Record<string, number> = {};
  const sortedNames = [...itemsRendered]
    .sort((a, b) => {
      const nameA = a.name || EMPTY_STRING;
      const nameB = b.name || EMPTY_STRING;
      if (nameA === nameB) return 0;
      if (sortOrder.toLowerCase() === 'ascending') {
        return nameA > nameB ? 1 : -1;
      }
      return nameA > nameB ? -1 : 1;
    })
    .map((item) => item.name || EMPTY_STRING);

  for (let index = 0; index < sortedNames.length; index++) {
    const name = sortedNames[index];
    const firstChar = name[0];
    if (!firstChar || letterStartToIndexMap[firstChar] != null) continue;
    letterStartToIndexMap[firstChar] = index;
  }
  return letterStartToIndexMap;
}
