import { getItemWithStoreSpecificValues } from './getItemWithStoreSpecificValues';

import { MOCK_STORES } from '@/components/mocks/mockStores';
import {
  Item,
  ItemUnit,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';

const MOCK_ITEM = {
  _id: '000012109120981-1-08912-01213',
  addedDate: Date.now() - 10000,
  images: [],
  imageToUseIndex: 0,
  lastUpdatedDate: Date.now() - 1000,
  unit: ItemUnit.Bar,
  frequency: 10000,
  name: 'Test',
  upc: '000000000001',
  inventoryMinimum: 0,
  needsSaving: true,
} as Item;

const MOCK_STORE_SPECIFIC_VALUES = {
  [StoreSpecificValueKey.AisleNumber]: {
    [MOCK_STORES[0].name]: '123',
  },
  [StoreSpecificValueKey.IsInCart]: {
    [MOCK_STORES[0].name]: true,
  },
  [StoreSpecificValueKey.ItemId]: {
    [MOCK_STORES[0].name]: 'abc',
  },
  [StoreSpecificValueKey.Note]: {
    [MOCK_STORES[0].name]: 'abc',
  },
  [StoreSpecificValueKey.Price]: {
    [MOCK_STORES[0].name]: 12.99,
  },
  [StoreSpecificValueKey.Quantity]: {
    [MOCK_STORES[0].name]: 3,
  },
} as unknown as Required<StoreSpecificValues>;

describe('getItemWithStoreSpecificValues', () => {
  test('it works', async () => {
    const actual = getItemWithStoreSpecificValues(
      MOCK_ITEM,
      MOCK_STORE_SPECIFIC_VALUES,
    );
    expect(Object.keys(MOCK_STORE_SPECIFIC_VALUES || {}).length).toBe(
      Object.keys(StoreSpecificValueKey).length,
    );
    expect(actual).toStrictEqual({
      ...MOCK_ITEM,
      ...MOCK_STORE_SPECIFIC_VALUES,
    });
  });
});
