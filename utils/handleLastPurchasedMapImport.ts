import { getItemForImport } from './helpers';

import { Item, LastPurchasedMap } from '@/types/Item';
import { Store } from '@/types/Store';

/**
 *Takes the imported data and makes sure the lastPurchasedMap names are replaced with the proper ids for stores and items
 **/
export function handleLastPurchasedMapImport(
  lastPurchasedMap: LastPurchasedMap,
  items: Item[],
  stores: Store[],
): LastPurchasedMap {
  if (!lastPurchasedMap) return {};
  const copy = { ...lastPurchasedMap };
  for (const [itemKey, itemValues] of Object.entries(lastPurchasedMap)) {
    for (const [storeKey, lastPurchasedTime] of Object.entries(
      itemValues || {},
    )) {
      const itemFound = getItemForImport(itemKey, items);
      const storeFound = getItemForImport(storeKey, stores);

      if (storeFound?._id && itemFound?._id) {
        (copy as any)[itemFound._id] = {
          [storeFound?._id]: lastPurchasedTime,
        };
      } else {
        console.warn(
          `handleLastPurchasedMapImport: deleting ${itemKey} from copy.`,
        );
        delete copy[itemKey];
      }

      if (!storeFound?._id) {
        console.warn(
          `handleLastPurchasedMapImport: Unable to find a store with key of '${storeKey}' in imported stores list`,
        );
      }
      if (!itemFound?._id) {
        console.warn(
          `handleLastPurchasedMapImport: Unable to find a item with key of '${itemKey}' in imported items list`,
        );
      }
    }
  }
  return copy;
}
