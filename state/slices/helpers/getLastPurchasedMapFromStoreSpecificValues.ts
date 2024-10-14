import {
  LastPurchasedMap,
  StoreSpecificValueKey,
  StoreSpecificValuesMap,
} from '@/types/Item';

/**
 *Takes in the {@link StoreSpecificValuesMap} and creates a {@link LastPurchasedMap}
 **/
export function getLastPurchasedFromStoreSpecificValues(
  storeSpecificValuesMap: StoreSpecificValuesMap,
  currentStoreId: string,
) {
  const toReturn = {} as LastPurchasedMap;
  if (!storeSpecificValuesMap) return toReturn;
  const now = Date.now();
  for (const key of Object.keys(storeSpecificValuesMap)) {
    if (
      storeSpecificValuesMap[key]?.[StoreSpecificValueKey.IsInCart]?.[
        currentStoreId
      ]
    ) {
      toReturn[key] = {
        ...toReturn[key],
        [currentStoreId]: now,
      };
    }
  }
  return toReturn;
}
