import { getSortedExpirationDates } from './getSortedExpirationDates';

import { SortOrder } from '@/components/lists/sorters';

describe('getSortedExpirationDates', () => {
  it('should sort expiration dates in ascending order by default', () => {
    const now = Date.parse('2023-10-01');
    const expirationDates = {
      [now]: 1,
      [now - 100]: 2,
      [now + 100]: 3,
    };
    const sortedDates = getSortedExpirationDates(expirationDates);
    expect(sortedDates).toEqual([
      [`${now - 100}`, 2],
      [`${now}`, 1],
      [`${now + 100}`, 3],
    ]);
  });

  it('should sort expiration dates in descending order when specified', () => {
    const now = Date.parse('2023-10-01');
    const expirationDates = {
      [now]: 1,
      [now - 100]: 2,
      [now + 100]: 3,
    };
    const sortedDates = getSortedExpirationDates(
      expirationDates,
      SortOrder.Descending,
    );
    expect(sortedDates).toEqual([
      [`${now + 100}`, 3],
      [`${now}`, 1],
      [`${now - 100}`, 2],
    ]);
  });
});
