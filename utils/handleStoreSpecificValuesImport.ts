import { getItemForImport } from './helpers';
import { iterateStoreSpecificValuesMap } from './iterateStoreSpecificValuesMap';
import { logWhenDevelopmentMode } from './logging';

import { Item, StoreSpecificValuesMap } from '@/types/Item';
import { Store } from '@/types/Store';

/**
 *Takes the imported data and makes sure the storeSpecificValues are replaced with the proper ids for stores and items
 **/
export function handleStoreSpecificValuesImport(
  storeSpecificValuesMap: StoreSpecificValuesMap,
  items: Item[],
  stores: Store[],
): StoreSpecificValuesMap {
  if (!storeSpecificValuesMap) return {};
  const copy = { ...storeSpecificValuesMap };
  iterateStoreSpecificValuesMap({
    storeSpecificValuesMap,
    onNewItemStart: ({ itemKey, storeSpecificValues }) => {
      const itemFound = getItemForImport(itemKey, items);
      if (!itemFound) {
        console.warn(
          `handleStoreSpecificValuesImport: Unable to find an item with key of '${itemKey}' in imported items list`,
        );
      } else {
        if (itemFound._id) {
          logWhenDevelopmentMode(
            `Replacing '${itemKey}' with '${itemFound._id}'`,
          );
          copy[itemFound._id] = storeSpecificValues;
        }
      }
    },
    onNewStoreValue: ({
      itemKey,
      storeSpecificValueKey,
      storeKey,
      storeValue,
    }) => {
      const storeFound = getItemForImport(storeKey, stores);
      if (!storeFound) {
        console.warn(
          `handleStoreSpecificValuesImport: Unable to find a store with key of '${storeKey}' in imported stores list`,
        );
      } else {
        if (storeFound._id) {
          logWhenDevelopmentMode(
            `Replacing '${storeKey}' with '${storeFound._id}'`,
          );
          delete (copy as any)[itemKey][storeSpecificValueKey][storeKey];
          (copy as any)[itemKey][storeSpecificValueKey][storeFound._id] =
            storeValue;
        }
      }
    },
  });
  return copy;
}
