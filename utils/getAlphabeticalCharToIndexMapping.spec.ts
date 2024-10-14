import { getAlphabeticalCharToIndexMapping } from './getAlphabeticalCharToIndexMapping';

import { MOCK_ITEMS_LIST } from '@/constants/testing';

describe('getAlphabeticalCharToIndexMapping', () => {
  test('it works ascending', async () => {
    const actual = getAlphabeticalCharToIndexMapping(MOCK_ITEMS_LIST.data);
    expect(actual).toStrictEqual({
      A: 0,
      B: 6,
      C: 23,
      D: 33,
      E: 35,
      F: 40,
      G: 43,
      H: 52,
      K: 56,
      L: 58,
      M: 61,
      N: 67,
      O: 68,
      P: 72,
      R: 89,
      S: 91,
      T: 108,
      U: 119,
      V: 121,
      Y: 128,
      Z: 129,
    });
  });
  test('it works descending', async () => {
    const actual = getAlphabeticalCharToIndexMapping(
      MOCK_ITEMS_LIST.data,
      'descending',
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
