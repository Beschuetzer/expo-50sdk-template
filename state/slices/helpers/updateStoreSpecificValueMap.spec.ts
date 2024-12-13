import { updateStoreSpecificValueMap } from './updateStoreSpecificValueMap';
import { ListsState } from '../listsSlice';

import {
  Item,
  StoreSpecificValueKey,
  StoreSpecificValueUpdater,
  StoreSpecificValues,
  StoreSpecificValuesMap,
} from '@/types/Item';
import { iterateStoreSpecificValuesMap } from '@/utils/iterateStoreSpecificValuesMap';

const KEY_TO_USE = 'keyToUse';
jest.mock('@/utils/helpers', () => {
  return {
    getSortOrderValues: jest.fn(),
    getKeyToUse: () => KEY_TO_USE,
  };
});

const MOCK_CURRENT_STORE = 'Cub';
const MOCK_CURRENT_STORE_QUANTITY = 3;
const currentItems = {
  one: {
    aisleNumber: {
      Costco: 0,
      [MOCK_CURRENT_STORE]: 0,
      'Target in North St. Paul, MN': 1910,
    },
    isInCart: {
      Costco: false,
      [MOCK_CURRENT_STORE]: false,
      'Target in North St. Paul, MN': false,
    },
    itemId: {
      Costco: '0000418264',
      [MOCK_CURRENT_STORE]: '44',
      'Target in North St. Paul, MN': '0000296993',
    },
    price: {
      Costco: 1,
      [MOCK_CURRENT_STORE]: 2,
      'Target in North St. Paul, MN': 148,
    },
    quantity: { [MOCK_CURRENT_STORE]: MOCK_CURRENT_STORE_QUANTITY },
  },
} as { [key: string]: StoreSpecificValues };

const MOCK_STATE = Object.freeze({
  currentStoreId: MOCK_CURRENT_STORE,
  storeSpecificValuesMap: {
    [KEY_TO_USE]: currentItems.one,
    upc2: currentItems.one,
  } as StoreSpecificValuesMap,
}) as unknown as ListsState;

describe('updateStoreSpecificValueMap', () => {
  it('can update quantity', async () => {
    const state = { ...MOCK_STATE };
    logState(state);

    updateStoreSpecificValueMap(
      state,
      {
        name: KEY_TO_USE,
        upc: '',
      } as Item,
      {
        quantity: (current) => {
          console.log({ current });
          return current + 1;
        },
      } as StoreSpecificValueUpdater,
      MOCK_CURRENT_STORE,
    );

    logState(state);

    expect(
      state.storeSpecificValuesMap?.[KEY_TO_USE]?.[
        StoreSpecificValueKey.Quantity
      ]?.[MOCK_CURRENT_STORE],
    ).toStrictEqual(MOCK_CURRENT_STORE_QUANTITY + 1);
  });

  it('can handle undefined store key', async () => {
    const state = {
      ...MOCK_STATE,
      storeSpecificValuesMap: {
        upc2: currentItems.one,
      } as StoreSpecificValuesMap,
    };
    logState(state);

    updateStoreSpecificValueMap(
      state,
      {
        name: KEY_TO_USE,
        upc: '',
      } as Item,
      {
        quantity: (current) => {
          console.log({ current });
          return current + 1;
        },
      } as StoreSpecificValueUpdater,
      MOCK_CURRENT_STORE,
    );

    logState(state);

    expect(
      state.storeSpecificValuesMap?.[KEY_TO_USE]?.[
        StoreSpecificValueKey.Quantity
      ]?.[MOCK_CURRENT_STORE],
    ).toStrictEqual(1);
  });

  it('can handle undefined value key', async () => {
    const state = {
      ...MOCK_STATE,
      storeSpecificValuesMap: {
        [KEY_TO_USE]: {},
        upc2: currentItems.one,
      } as StoreSpecificValuesMap,
    };
    logState(state);

    updateStoreSpecificValueMap(
      state,
      {
        name: KEY_TO_USE,
        upc: '',
      } as Item,
      {
        quantity: (current) => {
          console.log({ current });
          return current + 1;
        },
      } as StoreSpecificValueUpdater,
      MOCK_CURRENT_STORE,
    );

    logState(state);

    expect(
      state.storeSpecificValuesMap?.[KEY_TO_USE]?.[
        StoreSpecificValueKey.Quantity
      ]?.[MOCK_CURRENT_STORE],
    ).toStrictEqual(1);
  });
});

function logState(state: ListsState) {
  console.log('Logging State'.padEnd(200, '-'));

  iterateStoreSpecificValuesMap({
    storeSpecificValuesMap: state.storeSpecificValuesMap,
    onNewStoreSpecificValueStart: (input) => {
      console.log(input);
    },
  });

  console.log(''.padEnd(200, '-'));
}
