import { getHash } from './getHash';

import { getRandomItem } from '@/components/mocks/helpers';

const EXPECTED_NULL_HASH = 2090557760;
const EXPECTED_UNDEFINED_HASH = 3088032823;
const EXPECTED_TRUE_HASH = 2090770405;
const EXPECTED_FALSE_HASH = 258723568;
const EXPECTED_EMPTY_STRING_HASH = 127008428;

describe('getHash', () => {
  it('should work with undefined', () => {
    const result = getHash(undefined);
    expect(result).toBe(EXPECTED_UNDEFINED_HASH);
  });
  it('should work with null', () => {
    const result = getHash(null);
    expect(result).toBe(EXPECTED_NULL_HASH);
  });
  it('should work with empty string', () => {
    const result = getHash('');
    expect(result).toBe(EXPECTED_EMPTY_STRING_HASH);
  });
  it('should work with true', () => {
    const result = getHash(true);
    expect(result).toBe(EXPECTED_TRUE_HASH);
  });
  it('should work with false', () => {
    const result = getHash(false);
    expect(result).toBe(EXPECTED_FALSE_HASH);
  });
  it('should work with object', () => {
    //generate a deeply nested object with 1000 properties
    const obj: Record<string, any> = {};
    for (let i = 0; i < 2000; i++) {
      obj[`key${i}`] = { [`key${i}`]: { [`key${i}`]: { [`key${i}`]: i } } };
    }
    const start = performance.now();
    const result = getHash(obj);
    const end = performance.now();
    expect(end - start).toBeLessThan(10);
    expect(result).toBe(4026471153);
  });
  it('should work performantly for actual use case', () => {
    const arr = getMockItems(2000, 0);
    const start = performance.now();
    const result = getHash(arr);
    const end = performance.now();
    expect(end - start).toBeLessThan(20);
    expect(result).not.toBe(EXPECTED_EMPTY_STRING_HASH);
    expect(result).not.toBe(EXPECTED_TRUE_HASH);
    expect(result).not.toBe(EXPECTED_FALSE_HASH);
    expect(result).not.toBe(EXPECTED_NULL_HASH);
    expect(result).not.toBe(EXPECTED_UNDEFINED_HASH);
  });
  //write test to make sure that the hash is the same for the same object
  //write test to make sure that the hash is different for different objects
  //write test to make sure that the hash is the same for the same object with different order of keys
});

function getMockItems(count: number, startUpc: number) {
  const itemsList = [];

  for (let index = 0; index < count; index++) {
    const upcToUse = startUpc + index.toString().padStart(12, '0');
    itemsList.push(getRandomItem(upcToUse));
  }
  return itemsList;
}
