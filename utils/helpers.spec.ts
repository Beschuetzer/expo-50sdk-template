import { getDurationValue } from './helpers';

import { TimeSpan } from '@/types/general';

describe('getDurationValue', () => {
  it('should return the default duration when no number is provided', () => {
    const result = getDurationValue();
    expect(result).toEqual({
      number: 1,
      timeSpan: TimeSpan.Week,
    });
  });

  it('should return the correct duration for a number divisible by WEEK_IN_MS', () => {
    const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
    const result = getDurationValue(WEEK_IN_MS * 2);
    expect(result).toEqual({
      number: 2,
      timeSpan: TimeSpan.Week,
    });
  });

  it('should return the correct duration for a number divisible by DAY_IN_MS', () => {
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const result = getDurationValue(DAY_IN_MS * 3);
    expect(result).toEqual({
      number: 3,
      timeSpan: TimeSpan.Day,
    });
  });

  it('should return the correct duration for a number divisible by MONTH_IN_MS', () => {
    const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
    const result = getDurationValue(MONTH_IN_MS * 4);
    expect(result).toEqual({
      number: 4,
      timeSpan: TimeSpan.Month,
    });
  });

  it('should return the correct duration for a number divisible by YEAR_IN_MS', () => {
    const YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;
    const result = getDurationValue(YEAR_IN_MS * 2);
    expect(result).toEqual({
      number: 2,
      timeSpan: TimeSpan.Year,
    });
  });

  it('should return the correct duration for a number divisible by HOUR_IN_MS', () => {
    const HOUR_IN_MS = 60 * 60 * 1000;
    const result = getDurationValue(HOUR_IN_MS * 5);
    expect(result).toEqual({
      number: 5,
      timeSpan: TimeSpan.Hour,
    });
  });

  it('should return the nearest number of hours if it does not match any other duration', () => {
    const result = getDurationValue(12345);
    expect(result).toEqual({
      number: 1,
      timeSpan: TimeSpan.Hour,
    });
  });

  it('should return handle large number', () => {
    const result = getDurationValue(8083756800000);
    expect(result).toEqual({
      number: 13366,
      timeSpan: TimeSpan.Week,
    });
  });
});
