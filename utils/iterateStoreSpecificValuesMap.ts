import {
  StoreSpecificValues,
  StoreSpecificValue,
  StoreSpecificValuesMap,
} from '@/types/Item';

type OnNewItemInput = {
  /**
   *The key used to represent an item (either an id, upc, or name.  See getKeyToUse)
   **/
  itemKey: string;
  /**
   *The object with specific {@link StoreSpecificValueKey store values} as keys and an object of values of {@link StoreSpecificValue}
   **/
  storeSpecificValues: StoreSpecificValues;
};
type OnNewStoreSpecificValueInput = {
  /**
   *This is the key used for a specific store value (e.g. quantity, aisleNumber, etc)
   **/
  storeSpecificValueKey: string;
  /**
   *This is the object with stores as keys and actual values as values
   **/
  storeSpecificValueKeyValue: StoreSpecificValue<unknown>;
} & OnNewItemInput;
type OnNewStoreValueInput = {
  /**
   *The key used to represent the store
   **/
  storeKey: string;
  /**
   *The value at a given store.
   **/
  storeValue: unknown;
} & OnNewItemInput &
  OnNewStoreSpecificValueInput;

type IterateStoreSpecificValuesMapInput = {
  /**
   *This is called at the beginning of iterating over the item keys (begininning of 1st for loop)
   **/
  onNewItemStart?: (input: OnNewItemInput) => void;
  /**
   *This is called at the beginning of iterating over the item keys (end of 1st for loop)
   **/
  onNewItemEnd?: (input: OnNewItemInput) => void;
  /**
   *This is called at the beginning of iterating over the storeSpecificValues (e.g. keys are 'quantity', 'aisleNumber', etc; 2nd for loop)
   **/
  onNewStoreSpecificValueStart?: (input: OnNewStoreSpecificValueInput) => void;
  /**
   *This is called at the end of iterating over the storeSpecificValues (e.g. keys are 'quantity', 'aisleNumber', etc; 2nd for loop)
   **/
  onNewStoreSpecificValueEnd?: (input: OnNewStoreSpecificValueInput) => void;
  /**
   *This is called when iterating over the store keys (3nd for loop)
   **/
  onNewStoreValue?: (input: OnNewStoreValueInput) => void;
  storeSpecificValuesMap: StoreSpecificValuesMap;
};

export function iterateStoreSpecificValuesMap(
  input: IterateStoreSpecificValuesMapInput,
) {
  const {
    storeSpecificValuesMap,
    onNewItemEnd,
    onNewItemStart,
    onNewStoreSpecificValueStart,
    onNewStoreSpecificValueEnd,
    onNewStoreValue,
  } = input;

  for (const [itemKey, storeSpecificValues] of Object.entries(
    storeSpecificValuesMap || {},
  )) {
    onNewItemStart && onNewItemStart({ itemKey, storeSpecificValues });

    if (
      onNewStoreSpecificValueStart ||
      onNewStoreSpecificValueEnd ||
      onNewStoreValue
    ) {
      for (const [
        storeSpecificValueKey,
        storeSpecificValueKeyValue,
      ] of Object.entries(storeSpecificValues || {})) {
        onNewStoreSpecificValueStart &&
          onNewStoreSpecificValueStart({
            itemKey,
            storeSpecificValues,
            storeSpecificValueKey,
            storeSpecificValueKeyValue,
          });

        if (onNewStoreValue) {
          for (const [storeKey, storeValue] of Object.entries(
            storeSpecificValueKeyValue || {},
          )) {
            onNewStoreValue({
              itemKey,
              storeSpecificValues,
              storeSpecificValueKey,
              storeSpecificValueKeyValue,
              storeKey,
              storeValue,
            });
          }
        }

        onNewStoreSpecificValueEnd &&
          onNewStoreSpecificValueEnd({
            itemKey,
            storeSpecificValues,
            storeSpecificValueKey,
            storeSpecificValueKeyValue,
          });
      }
    }

    onNewItemEnd && onNewItemEnd({ itemKey, storeSpecificValues });
  }
}
