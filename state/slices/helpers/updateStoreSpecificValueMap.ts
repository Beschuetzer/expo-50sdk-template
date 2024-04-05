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
) {
  const keyToUse = getKeyToUse(key);
  for (const [valueName, value] of Object.entries(
    storeSpecificValuesToUpdate || {},
  )) {
    const currentItem = state.storeSpecificValuesMap?.[keyToUse] as any;
    const currentValues = currentItem?.[valueName];
    const currentValueAtCurrentStore = currentValues?.[state.currentStoreName];
    const newValueAtCurrentStore = (value as any)?.(currentValueAtCurrentStore);

    if (!currentItem || currentValues === undefined) {
      state.storeSpecificValuesMap[keyToUse] = {
        ...state.storeSpecificValuesMap[keyToUse],
        [valueName]: {
          ...currentValues,
          [state.currentStoreName]: newValueAtCurrentStore,
        },
      } as StoreSpecificValues;
    } else {
      currentItem[valueName][state.currentStoreName] = newValueAtCurrentStore;
    }
  }
}
