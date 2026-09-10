import { getAlphabeticalCharToIndexMapping } from './getAlphabeticalCharToIndexMapping';

import { SortOrder } from '@/components/lists/sorters';
import { getRandomTask } from '@/components/mocks/helpers';

describe('getAlphabeticalCharToIndexMapping', () => {
  const tasks = ['Apple', 'Banana', 'Carrot', 'apricot', 'Blueberry'].map(
    (title) => getRandomTask(title),
  );

  test('it works ascending', async () => {
    const actual = getAlphabeticalCharToIndexMapping(tasks);
    expect(actual).toStrictEqual({
      A: 0,
      B: 2,
      C: 4,
    });
  });

  test('it works descending', async () => {
    const actual = getAlphabeticalCharToIndexMapping(
      tasks,
      SortOrder.Descending,
    );
    expect(actual).toStrictEqual({
      A: 3,
      B: 1,
      C: 0,
    });
  });

  test('it returns an empty mapping for an empty list', async () => {
    expect(getAlphabeticalCharToIndexMapping([])).toStrictEqual({});
  });
});
