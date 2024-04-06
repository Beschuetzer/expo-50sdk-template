import {
  StoreSpecificValues,
  StoreSpecificValue,
  StoreSpecificValuesMap,
} from '@/types/Item';

type OnNewItemInput = {
  itemKey?: string;
  storeSpecificValues?: StoreSpecificValues;
};
type OnNewStoreSpecificValueInput = {
  storeSpecificValueKey?: string;
  storeSpecificValueKeyValue?: StoreSpecificValue<unknown>;
} & OnNewItemInput;

type IterateStoreSpecificValuesMapInput = {
  onNewItemStart?: (input: OnNewItemInput) => void;
  onNewItemEnd?: (input: OnNewItemInput) => void;
  onNewStoreSpecificValue?: (input: OnNewStoreSpecificValueInput) => void;
  storeSpecificValuesMap: StoreSpecificValuesMap;
};

export function iterateStoreSpecificValuesMap(
  input: IterateStoreSpecificValuesMapInput,
) {
  const {
    storeSpecificValuesMap,
    onNewItemEnd,
    onNewItemStart,
    onNewStoreSpecificValue,
  } = input;

  for (const [itemKey, storeSpecificValues] of Object.entries(
    storeSpecificValuesMap || {},
  )) {
    onNewItemStart && onNewItemStart({ itemKey, storeSpecificValues });
    for (const [
      storeSpecificValueKey,
      storeSpecificValueKeyValue,
    ] of Object.entries(storeSpecificValues || {})) {
      onNewStoreSpecificValue &&
        onNewStoreSpecificValue({
          itemKey,
          storeSpecificValueKey,
          storeSpecificValueKeyValue,
          storeSpecificValues,
        });
    }
    onNewItemEnd && onNewItemEnd({ itemKey, storeSpecificValues });
  }
}
