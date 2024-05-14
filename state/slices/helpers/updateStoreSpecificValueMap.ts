import { ListsState } from '../listsSlice';

import {
  Key,
  StoreSpecificValueUpdater,
  StoreSpecificValues,
} from '@/types/Item';
import { getKeyToUse } from '@/utils/helpers';

export function updateStoreSpecificValueMap(
  state: ListsState,
  key: Key,
  storeSpecificValuesToUpdate: StoreSpecificValueUpdater,
  storeName?: string,
) {
  const keyToUse = getKeyToUse(key);
  for (const [valueName, value] of Object.entries(
    storeSpecificValuesToUpdate || {},
  )) {
    const storeNameToUse = storeName || state.currentStoreName;
    const currentItem = state.storeSpecificValuesMap?.[keyToUse] as any;
    const currentValues = currentItem?.[valueName];
    const currentValueAtCurrentStore = currentValues?.[storeNameToUse];
    const newValueAtCurrentStore = (value as any)?.(currentValueAtCurrentStore);

    console.log({
      storeNameToUse,
      currentItem,
      currentValues,
      currentValueAtCurrentStore,
      newValueAtCurrentStore,
    });

    if (!currentItem || currentValues === undefined) {
      state.storeSpecificValuesMap[keyToUse] = {
        ...state.storeSpecificValuesMap[keyToUse],
        [valueName]: {
          ...currentValues,
          [storeNameToUse]: newValueAtCurrentStore,
        },
      } as StoreSpecificValues;
    } else {
      currentItem[valueName][storeNameToUse] = newValueAtCurrentStore;
    }
  }
}
