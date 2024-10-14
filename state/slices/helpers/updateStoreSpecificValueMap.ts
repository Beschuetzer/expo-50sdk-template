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
  storeId?: string,
) {
  const keyToUse = getKeyToUse(key);
  for (const [valueName, value] of Object.entries(
    storeSpecificValuesToUpdate || {},
  )) {
    const storeIdToUse = storeId || state.currentStoreId;
    const currentItem = state.storeSpecificValuesMap?.[keyToUse] as any;
    const currentValues = currentItem?.[valueName];
    const currentValueAtCurrentStore = currentValues?.[storeIdToUse];
    const newValueAtCurrentStore = (value as any)?.(currentValueAtCurrentStore);

    console.log({
      valueName,
      value,
      keyToUse,
      storeIdToUse,
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
          [storeIdToUse]: newValueAtCurrentStore,
        },
      } as StoreSpecificValues;
    } else {
      currentItem[valueName][storeIdToUse] = newValueAtCurrentStore;
    }
  }
}
