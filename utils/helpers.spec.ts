import {
  calculateDistance,
  camelCaseToSpacedCapitalized,
  ensureMaxLength,
  getAddressString,
  getAreStoresEqual,
  getBackendUrl,
  getButtonHitSlop,
  getCustomImageInfo,
  getDurationFromFrequency,
  getDurationInMilliseconds,
  getDurationValue,
  getFilteredList,
  getImagePickerOptions,
  getIndexOfSmallestField,
  getIsValidUpcValue,
  getItemForImport,
  getItemFromList,
  getItemValidation,
  getKeyToUse,
  getKeyToUseFieldName,
  getNewViewingMode,
  getS3Images,
  getS3ObjectKey,
  getStandardizedUpcValue,
  getStateFromString,
  getStoreDescriptor,
  getStoreWithDistance,
  getUserCredentials,
  isAddressValid,
  joinWithAnd,
  roundNumber,
  sanitize,
  sanitizeKey,
  wait,
  delay,
  trimObjectValues,
} from './helpers';

import { ItemTileViewingMode } from '@/components/tiles/ItemTile';
import { ItemUnit, StoreSpecificValueKey } from '@/types/Item';
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

  it('should return handle large number', () => {
    const result = getDurationValue(8083756800000);
    expect(result).toEqual({
      number: 13366,
      timeSpan: TimeSpan.Week,
    });
  });
});

describe('pure helper behavior', () => {
  const item = { _id: 'item-1', name: 'Milk', upc: '012345678905' } as any;
  const store = {
    _id: 'store-1',
    name: 'Market',
    addressLineOne: '1 Main Street',
    city: 'Saint Paul',
    state: State.Minnesota,
    zipCode: '55101',
    gpsCoordinates: { lat: '44.95', lon: '-93.09' },
  } as any;

  it('formats strings, truncates text, and joins lists', () => {
    expect(camelCaseToSpacedCapitalized('aisleNumber')).toBe('Aisle Number');
    expect(ensureMaxLength('abcdefgh', 6)).toBe('abc...');
    expect(ensureMaxLength('', 6)).toBeUndefined();
    expect(joinWithAnd([])).toBe('');
    expect(joinWithAnd(['one'])).toBe('one');
    expect(joinWithAnd(['one', 'two'])).toBe('one and two');
    expect(joinWithAnd(['one', 'two', 'three'])).toBe('one, two, and three');
  });

  it('formats addresses and validates address presence', () => {
    expect(getAddressString(store)).toBe('undefinedSaint Paul, MN 55101');
    expect(getAddressString(store, true)).toBe('in Saint Paul, MN 55101');
    expect(isAddressValid(store)).toBe(true);
    expect(isAddressValid({ addressLineOne: '' } as any)).toBe(false);
  });

  it('calculates distances and preserves store descriptors', () => {
    expect(calculateDistance(undefined, undefined)).toBe(-1);
    expect(calculateDistance(store.gpsCoordinates, store.gpsCoordinates)).toBe(
      0,
    );
    expect(
      getStoreWithDistance(store, store.gpsCoordinates).calculatedDistance,
    ).toBe(0);
    expect(getStoreDescriptor(store)).toBe('Market (Saint Paul)');
    expect(getStoreDescriptor({ name: 'Market' } as any)).toBe('Market');
    expect(getAreStoresEqual(store, { ...store })).toBe(true);
    expect(getAreStoresEqual(store, undefined)).toBe(false);
  });

  it('handles keys and item lookup consistently', () => {
    expect(getKeyToUse('plain-key')).toBe('plain-key');
    expect(getKeyToUse(item)).toBe('item-1');
    expect(getKeyToUseFieldName(item)).toBe('upc');
    expect(getKeyToUseFieldName({ name: 'Milk' } as any)).toBe('name');
    expect(getItemValidation(item)).toEqual({
      isValid: true,
      message: undefined,
    });
    expect(getItemValidation()).toEqual({
      isValid: false,
      message: 'Please enter a name',
    });
    expect(getItemForImport('item-1', [item])).toEqual(item);
    expect(getItemFromList([item], 'item-1')).toEqual(item);
    expect(getItemFromList([], 'missing')).toBeNull();
  });

  it('validates UPCs and normalizes UPC values', () => {
    expect(getIsValidUpcValue('012345678905')).toBe(true);
    expect(getIsValidUpcValue('not-a-upc')).toBe(false);
    expect(getStandardizedUpcValue('012345678905')).toBe('012345678905');
    expect(getStandardizedUpcValue('0012345678905')).toBe('012345678905');
    expect(getStandardizedUpcValue('123')).toBeUndefined();
  });

  it('handles duration, view mode, and numeric helpers', () => {
    expect(
      getDurationInMilliseconds({ number: 2, timeSpan: TimeSpan.Day }),
    ).toBe(2 * 24 * 60 * 60 * 1000);
    expect(
      getDurationFromFrequency({ number: 2, timeSpan: TimeSpan.Hour }),
    ).toBe(2 * 60 * 60 * 1000);
    expect(getDurationFromFrequency()).toBe(0);
    expect(getNewViewingMode(ItemTileViewingMode.Basic)).toBe(
      ItemTileViewingMode.Full,
    );
    expect(getButtonHitSlop(2)).toEqual({
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    });
    expect(roundNumber(12.3456)).toBe(12.35);
  });

  it('filters items and finds the smallest field', () => {
    expect(
      getFilteredList([item, { ...item, name: 'Bread' }], { name: 'milk' }),
    ).toEqual([item]);
    expect(getIndexOfSmallestField([{ value: 4 }, { value: 2 }], 'value')).toBe(
      1,
    );
    expect(getIndexOfSmallestField([], 'value')).toBe(-1);
  });

  it('extracts image URLs and applies picker defaults', () => {
    expect(
      getCustomImageInfo({ ...item, images: ['https://example.com/a.jpg'] }),
    ).toEqual([undefined, -1]);
    expect(
      getS3ObjectKey('https://bucket.s3.amazonaws.com/path/image.jpg'),
    ).toBe('path/image.jpg');
    expect(getS3ObjectKey('')).toBeUndefined();
    expect(
      getS3Images(['https://grocify-images.s3.amazonaws.com/a', 'local.jpg']),
    ).toEqual(['https://grocify-images.s3.amazonaws.com/a']);
    expect(getImagePickerOptions({ quality: 0.5 }).quality).toBe(0.5);
  });

  it('trims object values and returns credentials', () => {
    expect(trimObjectValues({ a: ' value ', b: 2 })).toEqual({
      a: 'value',
      b: 2,
    });
    expect(sanitize('  Milk  ')).toBe('  Milk  ');
    expect(sanitizeKey({ name: ' Milk ', upc: ' 123 ' } as any)).toMatchObject({
      name: ' Milk ',
      upc: ' 123 ',
    });
    expect(
      getUserCredentials({ _id: 'user-1', password: 'secret' } as any),
    ).toEqual({
      userId: 'user-1',
      password: 'secret',
    });
  });

  it('maps state strings and returns validation for empty values', () => {
    expect(getStateFromString(State.Minnesota)).toBe(State.Minnesota);
    expect(getStateFromString()).toBe(State.None);
    expect(getStateFromString('unknown')).toBe(State.None);
    expect(StoreSpecificValueKey.Quantity).toBe('quantity');
    expect(ItemUnit.Package).toBeDefined();
  });

  it('resolves the backend URL from the environment', () => {
    expect(getBackendUrl()).toBe(
      'https://grocify-bff-ac27c2662495.herokuapp.com',
    );
  });

  it('returns immediately for non-positive waits and delays', async () => {
    await expect(wait(0)).resolves.toBeUndefined();
    await expect(delay(-1)).resolves.toBeUndefined();
  });
});
