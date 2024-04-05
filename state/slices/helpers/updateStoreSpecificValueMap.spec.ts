import { updateStoreSpecificValueMap } from './updateStoreSpecificValueMap';
import { ListsState } from '../listsSlice';

import {
  Item,
  StoreSpecificValueUpdater,
  StoreSpecificValuesMap,
} from '@/types/Item';

jest.mock('@/utils/helpers', () => {
  return {
    getSortOrderValues: jest.fn(),
    getKeyToUse: () => 'keyToUse',
  };
});

const currentItems = {
  one: {
    aisleNumber: { Costco: 0, Cub: 0, 'Target in North St. Paul, MN': 1910 },
    isInCart: {
      Costco: false,
      Cub: false,
      'Target in North St. Paul, MN': false,
    },
    itemId: {
      Costco: '0000418264',
      Cub: '44',
      'Target in North St. Paul, MN': '0000296993',
    },
    price: { Costco: 1, Cub: 2, 'Target in North St. Paul, MN': 148 },
    quantity: { Cub: 3 },
  },
} as { [key:string]: };

const MOCK_STATE = Object.freeze({
  currentStoreName: '3',
  storeSpecificValuesMap: {
    upc1: currentItems.one,
    upc2: currentItems.one,
  } as StoreSpecificValuesMap,
}) as unknown as ListsState;

describe('updateStoreSpecificValueMap', () => {
  it('can update quantity', async () => {
    const state = {...MOCK_STATE};
    logState(state)

    updateStoreSpecificValueMap(
      MOCK_STATE,
      {
        name: 'upc1',
        upc: '',
      } as Item,
      {
        quantity: (current) => current++,
      } as StoreSpecificValueUpdater,
    );

    logState(state)


    expect(true).toBe(false);
  });
});

function logState(state: any) {
    for (const iterator of object) {
        
    }
}
