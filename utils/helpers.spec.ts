import {
  calculateDistance,
  camelCaseToSpacedCapitalized,
  ensureMaxLength,
  getAddressString,
  getBackendUrl,
  getButtonHitSlop,
  getCustomImageInfo,
  getDurationInMilliseconds,
  getDurationValue,
  getFilteredList,
  getImagePickerOptions,
  getIndexOfSmallestField,
  getTaskForImport,
  getTaskFromList,
  getTaskValidation,
  getKeyToUse,
  getNewViewingMode,
  getS3Images,
  getS3ObjectKey,
  getStateFromString,
  getUserCredentials,
  isAddressValid,
  joinWithAnd,
  roundNumber,
  sanitize,
  sanitizeKey,
  trimObjectValues,
} from './helpers';

import { TaskTileViewingMode } from '@/types/Task';
import { State, TimeSpan } from '@/types/general';

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
});

describe('pure helper behavior', () => {
  const task = {
    _id: 'task-1',
    title: 'Milk',
    code: '012345678905',
  } as any;
  const address = {
    addressLineOne: '1 Main Street',
    city: 'Saint Paul',
    state: State.Minnesota,
    zipCode: '55101',
  } as any;

  it('formats strings, truncates text, and joins lists', () => {
    expect(camelCaseToSpacedCapitalized('dueDate')).toBe('Due Date');
    expect(ensureMaxLength('abcdefgh', 6)).toBe('abc...');
    expect(ensureMaxLength('', 6)).toBe('');
    expect(joinWithAnd([])).toBe('');
    expect(joinWithAnd(['one'])).toBe('one');
    expect(joinWithAnd(['one', 'two'])).toBe('one and two');
    expect(joinWithAnd(['one', 'two', 'three'])).toBe('one, two, and three');
  });

  it('formats addresses and validates address presence', () => {
    expect(getAddressString(address)).toBe('Saint Paul, MN 55101');
    expect(getAddressString(address, true)).toBe('in Saint Paul, MN 55101');
    expect(isAddressValid(address)).toBe(true);
    expect(isAddressValid({ addressLineOne: '' } as any)).toBe(false);
  });

  it('calculates distances between gps coordinates', () => {
    const gpsCoordinate = { lat: '44.95', lon: '-93.09' };
    expect(calculateDistance(undefined, undefined)).toBe(-1);
    expect(calculateDistance(gpsCoordinate, gpsCoordinate)).toBe(0);
  });

  it('handles keys and task lookup consistently', () => {
    expect(getKeyToUse('plain-key')).toBe('plain-key');
    expect(getKeyToUse(task)).toBe('task-1');
    expect(getTaskValidation(task)).toEqual({
      isValid: true,
      message: '',
    });
    expect(getTaskValidation()).toEqual({
      isValid: false,
      message: 'Please enter a title',
    });
    expect(getTaskForImport('task-1', [task])).toEqual(task);
    expect(getTaskFromList([task], 'task-1')).toEqual(task);
    expect(getTaskFromList([], 'missing')).toBeNull();
  });

  it('resolves US state abbreviations from strings', () => {
    expect(getStateFromString('MN')).toBe(State.Minnesota);
    expect(getStateFromString('Minnesota')).toBe(State.Minnesota);
    expect(getStateFromString(undefined)).toBe(State.None);
  });

  it('handles duration, view mode, and numeric helpers', () => {
    expect(
      getDurationInMilliseconds({ number: 2, timeSpan: TimeSpan.Day }),
    ).toBe(2 * 24 * 60 * 60 * 1000);
    expect(getNewViewingMode(TaskTileViewingMode.Basic)).toBe(
      TaskTileViewingMode.Full,
    );
    expect(getButtonHitSlop(2)).toEqual({
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    });
    expect(roundNumber(12.3456)).toBe(12.35);
  });

  it('filters tasks and finds the smallest field', () => {
    expect(
      getFilteredList([task, { ...task, title: 'Bread' }], { title: 'milk' }),
    ).toEqual([task]);
    expect(getIndexOfSmallestField([{ value: 4 }, { value: 2 }], 'value')).toBe(
      1,
    );
    expect(getIndexOfSmallestField([], 'value')).toBe(-1);
  });

  it('extracts image URLs and applies picker defaults', () => {
    expect(
      getCustomImageInfo({ ...task, images: ['https://example.com/a.jpg'] }),
    ).toEqual(['', -1]);
    expect(
      getS3ObjectKey('https://bucket.s3.amazonaws.com/path/image.jpg'),
    ).toBe('path/image.jpg');
    expect(getS3ObjectKey('')).toBe('');
    expect(
      getS3Images(['https://my-bucket.s3.amazonaws.com/a', 'local.jpg']),
    ).toEqual(['https://my-bucket.s3.amazonaws.com/a']);
    expect(getImagePickerOptions({ quality: 0.5 }).quality).toBe(0.5);
  });

  it('trims object values and returns credentials', () => {
    expect(trimObjectValues({ a: ' value ', b: 2 })).toEqual({
      a: 'value',
      b: 2,
    });
    expect(sanitize('  Milk  ')).toBe('  Milk  ');
    expect(
      sanitizeKey({ title: ' Milk ', code: ' 123 ' } as any),
    ).toMatchObject({
      title: ' Milk ',
      code: ' 123 ',
    });
    expect(
      getUserCredentials({ _id: 'user-1', password: 'secret' } as any),
    ).toEqual({
      userId: 'user-1',
      password: 'secret',
    });
  });

  it('resolves the backend url based on dev/prod mode', () => {
    expect(getBackendUrl()).toMatch(/^https?:\/\//);
  });
});
