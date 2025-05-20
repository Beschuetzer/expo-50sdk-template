import { getAlphabeticalCharToIndexMapping } from './getAlphabeticalCharToIndexMapping';

import { SortOrder } from '@/components/lists/sorters';
import { MOCK_ITEMS_LIST } from '@/constants/testing';

describe('getAlphabeticalCharToIndexMapping', () => {
  test('it works ascending', async () => {
    const actual = getAlphabeticalCharToIndexMapping(MOCK_ITEMS_LIST.data);
    expect(actual).toStrictEqual({
      A: 0,
      B: 7,
      C: 24,
      D: 34,
      E: 36,
      F: 41,
      G: 44,
      H: 53,
      K: 57,
      L: 59,
      M: 62,
      N: 68,
      O: 69,
      P: 73,
      R: 90,
      S: 92,
      T: 109,
      U: 120,
      V: 122,
      Y: 129,
      Z: 130,
    });
  });
  test('it works descending', async () => {
    const actual = getAlphabeticalCharToIndexMapping(
      MOCK_ITEMS_LIST.data,
      SortOrder.Descending,
    );
    expect(actual).toStrictEqual({
      A: 125,
      B: 108,
      C: 98,
      D: 96,
      E: 91,
      F: 88,
      G: 79,
      H: 75,
      K: 73,
      L: 70,
      M: 64,
      N: 63,
      O: 59,
      P: 42,
      R: 40,
      S: 23,
      T: 12,
      U: 10,
      V: 3,
      Y: 2,
      Z: 0,
    });
  });
});
