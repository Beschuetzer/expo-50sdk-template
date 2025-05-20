import { getMostRecentExpirationDates } from './getMostRecentExpirationDates';

describe('getMostRecentExpirationDates', () => {
  it('should return {} when expirationDates is undefined', () => {
    const result = getMostRecentExpirationDates(
      undefined as any,
      undefined as any,
    );
    expect(result).toEqual({});
  });

  it('should return {} when numberToGet is <= 0', () => {
    const now = Date.now();
    const expirationDates = {
      [now + 100]: 5,
      [now + 300]: 2,
    };
    expect(getMostRecentExpirationDates(expirationDates, 0)).toEqual({});
    expect(getMostRecentExpirationDates(expirationDates, -1)).toEqual({});
  });

  it('should take only a portion from the first key if numberToGet is less than available quantity', () => {
    const now = Date.now();
    const expirationDates = {
      [now + 100]: 5,
      [now + 300]: 2,
    };
    // numberToGet is less than the quantity at the first key.
    const result = getMostRecentExpirationDates(expirationDates, 3);
    expect(result).toEqual({
      [now + 100]: 3,
    });
  });

  it('all from one', () => {
    const now = Date.now();
    const expirationDates = {
      [now + 100]: 5,
      [now + 300]: 2,
    };
    // Entire quantity comes from the first key because numberToGet=1 < 5.
    const result = getMostRecentExpirationDates(expirationDates, 1);
    expect(result).toEqual({
      [now + 100]: 1,
    });
  });

  it('from multiple keys when numberToGet spans over them', () => {
    const now = Date.now();
    const expirationDates = {
      [now + 100]: 5,
      [now + 300]: 2,
    };
    // numberToGet = 6, so it takes all 5 from the first key and 1 from the second.
    const result = getMostRecentExpirationDates(expirationDates, 6);
    expect(result).toEqual({
      [now + 100]: 5,
      [now + 300]: 1,
    });
  });

  it('should return all available quantities if total is less than numberToGet', () => {
    const now = Date.now();
    const expirationDates = {
      [now + 50]: 2,
      [now + 150]: 3,
    };
    // total available is 2+3 = 5, but numberToGet is 10.
    // In this implementation, we return as many items as available.
    const result = getMostRecentExpirationDates(expirationDates, 10);
    expect(result).toEqual({
      [now + 50]: 2,
      [now + 150]: 3,
    });
  });

  it('should ignore quanties lt or eq to 0', () => {
    const now = Date.now();
    const expirationDates = {
      [now + 100]: -5,
      [now + 300]: 0,
      [now + 400]: null,
      [now + 500]: 2,
      [now + 600]: 2,
    };
    const result = getMostRecentExpirationDates(expirationDates as any, 6);
    expect(result).toEqual({
      [now + 500]: 2,
      [now + 600]: 2,
    });
  });

  it('should handle an empty expirationDates object', () => {
    const result = getMostRecentExpirationDates({}, 5);
    expect(result).toEqual({});
  });
});
