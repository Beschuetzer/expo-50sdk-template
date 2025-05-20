import { getExpirationDates } from './getExpirationDates';

describe('getExpirationDates', () => {
  it('should return an empty object when given an empty array', () => {
    const result = getExpirationDates([]);
    expect(result).toEqual({});
  });

  it('should correctly count expiration dates from string values', () => {
    const now = Date.now();
    const result = getExpirationDates([
      now + 100000000000,
      `${now + 100000000000}`,
      now + 200000000000,
      now + 300000000000,
      now + 100000000000,
    ]);
    const expected = {
      [now + 100000000000]: 3,
      [now + 200000000000]: 1,
      [now + 300000000000]: 1,
    };
    expect(result).toEqual(expected);
  });

  it('should correctly count expiration dates from string values', () => {
    const now = Date.now();
    const result = getExpirationDates([
      new Date(now + 100000000000).toISOString(),
      new Date(now + 100000000000).toISOString(),
      new Date(now + 100000000000).toISOString(),
      now + 200000000000,
      now + 300000000000,
    ]);
    const expected = {
      [now + 100000000000]: 3,
      [now + 200000000000]: 1,
      [now + 300000000000]: 1,
    };
    expect(result).toEqual(expected);
  });

  it('should handle invalid date strings gracefully', () => {
    const result = getExpirationDates([
      'invalid-date',
      '202-10-01',
      '2022-10-01',
      100000,
    ]);
    const expected = {
      '100000': 1,
      '1664582400000': 1,
    };
    expect(result).toEqual(expected);
  });
});
