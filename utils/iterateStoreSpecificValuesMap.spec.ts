import {
  ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE,
  iterateStoreSpecificValuesMap,
} from './iterateStoreSpecificValuesMap';

import { getMockStoreSpecificValuesMap } from '@/constants/testing';
import { StoreSpecificValueKey, StoreSpecificValuesMap } from '@/types/Item';

describe('iterateStoreSpecificValuesMap', () => {
  it('should iterate 5000 items and 100 stores within an acceptable time threshold', () => {
    const maxAllowedDuration = 750;
    const numItems = 5000;
    const numStores = 100;
    const storeSpecificValuesMap = getMockStoreSpecificValuesMap(
      numItems,
      numStores,
    );
    const startTime = performance.now();
    const itemIds = new Set<string>();
    const storeId = `store-${numStores - 1}`;

    iterateStoreSpecificValuesMap({
      storeSpecificValuesMap,
      onNewStoreSpecificValueStart: (input) => {
        const { storeSpecificValueKey } = input;
        if (
          storeSpecificValueKey !== StoreSpecificValueKey.IsInCart &&
          storeSpecificValueKey !== StoreSpecificValueKey.Quantity
        ) {
          return ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE;
        }
      },
      onNewStoreValue: (input) => {
        const { storeSpecificValues, itemKey, storeKey } = input;
        if (storeKey !== storeId) return;
        if (
          storeSpecificValues?.[StoreSpecificValueKey.IsInCart]?.[storeId] ||
          (storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[storeId] &&
            storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[storeId] >
              0)
        ) {
          itemIds.add(itemKey);
        }
      },
    });
    const duration = performance.now() - startTime;
    console.log(`Duration: ${duration}ms`);
    expect(duration).toBeLessThan(maxAllowedDuration);
  });

  it('should do nothing when the storeSpecificValuesMap is empty', () => {
    const emptyMap: StoreSpecificValuesMap = {};
    const onStart = jest.fn();
    const onValue = jest.fn();

    iterateStoreSpecificValuesMap({
      storeSpecificValuesMap: emptyMap,
      onNewStoreSpecificValueStart: onStart,
      onNewStoreValue: onValue,
    });

    expect(onStart).not.toHaveBeenCalled();
    expect(onValue).not.toHaveBeenCalled();
  });

  it('should skip calling onNewStoreValue if onNewStoreSpecificValueStart returns skip value', () => {
    const testMap: StoreSpecificValuesMap = {
      'item-1': {
        [StoreSpecificValueKey.IsInCart]: { 'store-A': true },
        [StoreSpecificValueKey.Quantity]: { 'store-A': 5 },
      },
    };

    const onStart = jest.fn(() => ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE);
    const onValue = jest.fn();

    iterateStoreSpecificValuesMap({
      storeSpecificValuesMap: testMap,
      onNewStoreSpecificValueStart: onStart,
      onNewStoreValue: onValue,
    });

    // There are two keys in item-1 so onNewStoreSpecificValueStart should be called twice
    expect(onStart).toHaveBeenCalledTimes(2);
    // Since we instructed to skip in every case no onNewStoreValue calls occur.
    expect(onValue).not.toHaveBeenCalled();
  });

  it('should call onNewStoreValue for each store value when not skipped', () => {
    const testMap: StoreSpecificValuesMap = {
      'item-1': {
        [StoreSpecificValueKey.IsInCart]: { 'store-A': true, 'store-B': false },
      },
    };

    const onStart = jest.fn(() => undefined); // Do not skip any values.
    const onValue = jest.fn();

    iterateStoreSpecificValuesMap({
      storeSpecificValuesMap: testMap,
      onNewStoreSpecificValueStart: onStart,
      onNewStoreValue: onValue,
    });

    // For item-1, key IsInCart: two store keys => onNewStoreValue should be called twice.
    expect(onValue).toHaveBeenCalledTimes(2);
  });

  it('should iterate over multiple items and keys correctly', () => {
    const testMap: StoreSpecificValuesMap = {
      'item-1': {
        [StoreSpecificValueKey.IsInCart]: { 'store-A': true },
        [StoreSpecificValueKey.Quantity]: { 'store-A': 1 },
      },
      'item-2': {
        [StoreSpecificValueKey.Price]: { 'store-B': 99.9 },
        [StoreSpecificValueKey.Quantity]: { 'store-B': 3 },
      },
    };

    const onStart = jest.fn(() => undefined);
    const onValue = jest.fn();

    iterateStoreSpecificValuesMap({
      storeSpecificValuesMap: testMap,
      onNewStoreSpecificValueStart: onStart,
      onNewStoreValue: onValue,
    });

    // Test with complex map:
    // item-1: 2 keys => onNewStoreSpecificValueStart called 2 times, onNewStoreValue called 1 time per key if store key exists = 1 per key (total: 2)
    // item-2: 2 keys => same logic => 2 calls onNewStoreValue where store keys exist
    expect(onStart).toHaveBeenCalledTimes(4);
    expect(onValue).toHaveBeenCalledTimes(4); // because for item-2, Price key isn't filtered for any store check in our callback (if onNewStoreSpecificValueStart returns undefined it iterates but our onValue callback logic might not add if conditions are not met)
  });

  it('should propagate errors thrown by onNewStoreValue', () => {
    const error = new Error('Test error');
    const testMap: StoreSpecificValuesMap = {
      'item-1': {
        [StoreSpecificValueKey.IsInCart]: { 'store-A': true },
      },
    };

    const onStart = jest.fn(() => undefined);
    const onValue = jest.fn(() => {
      throw error;
    });

    expect(() =>
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap: testMap,
        onNewStoreSpecificValueStart: onStart,
        onNewStoreValue: onValue,
      }),
    ).toThrow(error);
  });
});
