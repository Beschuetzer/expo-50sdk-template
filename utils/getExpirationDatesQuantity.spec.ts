import { getExpirationDatesQuantity } from './getExpirationDatesQuantity';

describe('getExpirationDatesQuantity', () => {
  it('should return 0 when expirationDates is undefined', () => {
    const result = getExpirationDatesQuantity(undefined);
    expect(result).toBe(0);
  });

  it('should return 0 when expirationDates is an empty object', () => {
    const result = getExpirationDatesQuantity({});
    expect(result).toBe(0);
  });

  it('should return the sum of all expiration dates quantities', () => {
    const expirationDates = {
      '2023-10-01': 5,
      '2023-10-02': 10,
      '2023-10-03': 15,
    };
    const result = getExpirationDatesQuantity(expirationDates);
    expect(result).toBe(30);
  });

  it('should ignore negative numbers in expiration dates', () => {
    const expirationDates = {
      '2023-10-01': -5,
      '2023-10-02': undefined,
      '2023-10-03': 4,
      '2023-10-04': NaN,
    };
    const result = getExpirationDatesQuantity(expirationDates as any);
    expect(result).toBe(4);
  });

  it('should ignore invalid entries in expiration dates', () => {
    const expirationDates = {
      '2023-10-01': 5,
      '2023-10-02': undefined,
      '2023-10-03': null,
      '2023-10-04': NaN,
    };
    const result = getExpirationDatesQuantity(expirationDates as any);
    expect(result).toBe(5);
  });
});
