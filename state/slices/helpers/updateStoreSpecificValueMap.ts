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
  console.log(''.padStart(200, '-'));

  console.log({ storeSpecificValuesToUpdate });

  const keyToUse = getKeyToUse(key);
  for (const [valueName, value] of Object.entries(
    storeSpecificValuesToUpdate || {},
  )) {
    const currentItem = state.storeSpecificValuesMap?.[keyToUse] as any;
    const currentValues = currentItem?.[valueName]?.[state.currentStoreName];
    const currentValueAtCurrentStore = currentValues?.[state.currentStoreName];
    const newValue = (value as any)?.(currentValues);

    console.log({ valueName, value });
    console.log({
      currentItem,
      currentValue: currentValues,
      currentValueAtCurrentStore,
      newValue,
    });

    if (!currentItem || currentValues === undefined) {
      console.log('1');

      state.storeSpecificValuesMap[keyToUse] = {
        ...state.storeSpecificValuesMap[keyToUse],
        [valueName]: {
          ...currentValues,
          [state.currentStoreName]: newValue,
        },
      } as StoreSpecificValues;
    } else {
      console.log('2');

      currentItem[valueName][state.currentStoreName] = newValue;
    }
  }
}
