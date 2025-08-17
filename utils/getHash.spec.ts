import { getHash } from './getHash';

import { getRandomItem } from '@/components/mocks/helpers';

const EXPECTED_NULL_HASH = 2090557760;
const EXPECTED_UNDEFINED_HASH = 3088032823;
const EXPECTED_TRUE_HASH = 2090770405;
const EXPECTED_FALSE_HASH = 258723568;
const EXPECTED_EMPTY_STRING_HASH = 5381;

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
  it('produces a deterministic hash for a large nested object', () => {
    const obj: Record<string, any> = {};
    for (let i = 0; i < 2000; i++) {
      obj[`key${i}`] = { [`key${i}`]: { [`key${i}`]: { [`key${i}`]: i } } };
    }
    const result1 = getHash(obj);
    const result2 = getHash(obj);
    expect(result1).toBe(result2);
  });

  it('is approximately linear (time per element does not explode with input size)', () => {
    // Rather than asserting on absolute milliseconds (flaky across machines),
    // compare per-item time for two sizes. Allow generous factor to avoid CI noise.
    const small = getMockItems(200, 0);
    const large = getMockItems(800, 100000); // 4x larger

    const measure = (fn: () => void) => {
      const start = performance.now();
      fn();
      return performance.now() - start;
    };

    // Warm up JIT / caches
    getHash([]);

    const smallTime = measure(() => getHash(small));
    const largeTime = measure(() => getHash(large));

    const perItemSmall = smallTime / small.length;
    const perItemLarge = largeTime / large.length;

    // If the algorithm became quadratic, perItemLarge would be ~4x higher (since total ~16x).
    // We allow a 2.5x buffer for runtime variance.
    expect(perItemLarge).toBeLessThan(perItemSmall * 2.5);
  });

  it('hash is stable regardless of object key insertion order', () => {
    const base: Record<string, number> = { a: 1, b: 2, c: 3, d: 4 };
    const hash1 = getHash(base);
    const shuffledKeys = Object.keys(base).sort(() => Math.random() - 0.5);
    const reordered: Record<string, number> = {};
    for (const k of shuffledKeys) reordered[k] = base[k];
    const hash2 = getHash(reordered);
    expect(hash2).toBe(hash1);
  });

  it('hash changes when a value changes', () => {
    const obj: Record<string, any> = { a: 1, b: 2 };
    const h1 = getHash(obj);
    obj.b = 3; // mutate
    const h2 = getHash(obj);
    expect(h2).not.toBe(h1);
  });

  it('hash changes when an element is added to an array', () => {
    const arr1 = [1, 2, 3];
    const h1 = getHash(arr1);
    const arr2 = [...arr1, 4];
    const h2 = getHash(arr2);
    expect(h2).not.toBe(h1);
  });
});

function getMockItems(count: number, startUpc: number) {
  const itemsList = [];
  for (let index = 0; index < count; index++) {
    const upcToUse = startUpc + index.toString().padStart(12, '0');
    itemsList.push(getRandomItem(upcToUse));
  }
  return itemsList;
}
