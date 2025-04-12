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
  onNewItemStart?: (input: OnNewItemInput) => any;
  /**
   *This is called at the beginning of iterating over the item keys (end of 1st for loop)
   **/
  onNewItemEnd?: (input: OnNewItemInput) => any;
  /**
   *This is called at the beginning of iterating over the storeSpecificValues (e.g. keys are 'quantity', 'aisleNumber', etc; 2nd for loop)
   **/
  onNewStoreSpecificValueStart?: (input: OnNewStoreSpecificValueInput) => any;
  /**
   *This is called at the end of iterating over the storeSpecificValues (e.g. keys are 'quantity', 'aisleNumber', etc; 2nd for loop)
   **/
  onNewStoreSpecificValueEnd?: (input: OnNewStoreSpecificValueInput) => any;
  /**
   *This is called when iterating over the store keys (3nd for loop)
   **/
  onNewStoreValue?: (input: OnNewStoreValueInput) => void;
  storeSpecificValuesMap: StoreSpecificValuesMap;
};

/**
 *This is a value that can be returned inside of {@link IterateStoreSpecificValuesMapInput.onNewItemStart onNewItemStart} or {@link IterateStoreSpecificValuesMapInput.onNewStoreSpecificValueStart onNewStoreSpecificValueStart} to skip the current iteration in the loop
 **/
export const ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE = null;

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

  //iterate over the item keys
  for (const [itemKey, storeSpecificValues] of Object.entries(
    storeSpecificValuesMap || {},
  )) {
    const returnedOnNewItemStart =
      onNewItemStart &&
      onNewItemStart({
        itemKey,
        storeSpecificValues,
      });

    if (returnedOnNewItemStart === ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE)
      continue;
    if (
      onNewStoreSpecificValueStart ||
      onNewStoreSpecificValueEnd ||
      onNewStoreValue
    ) {
      //iterate over the storeSpecificValues for each itemKey (these are constant)
      for (const [
        storeSpecificValueKey,
        storeSpecificValueKeyValue,
      ] of Object.entries(storeSpecificValues || {})) {
        const returnedonNewStoreSpecificValueStart =
          onNewStoreSpecificValueStart &&
          onNewStoreSpecificValueStart({
            itemKey,
            storeSpecificValues,
            storeSpecificValueKey,
            storeSpecificValueKeyValue,
          });

        if (
          returnedonNewStoreSpecificValueStart ===
          ITERATE_STORE_SPECIFIC_VALUES_MAP_SKIP_VALUE
        )
          continue;
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
