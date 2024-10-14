import { getLastPurchasedFromStoreSpecificValues } from './getLastPurchasedMapFromStoreSpecificValues';

import { MOCK_UPCS } from '@/components/mocks/constants';
import { MOCK_STORES } from '@/components/mocks/mockStores';
import { StoreSpecificValuesMap } from '@/types/Item';

const maxAllowedTimeDiff = 50;

describe('getLastPurchasedFromStoreSpecificValues', () => {
  test('handles empty object', () => {
    const actual = getLastPurchasedFromStoreSpecificValues(
      {},
      MOCK_STORES[0].name,
    );
    expect(actual).toStrictEqual({});
  });
  test('returns the correct object', () => {
    const mockStoreSpecificValues = {
      [MOCK_UPCS[0]]: {
        aisleNumber: {
          [MOCK_STORES[0].name]: 10,
          [MOCK_STORES[1].name]: 1000,
        },
        isInCart: {
          [MOCK_STORES[0].name]: true,
          [MOCK_STORES[1].name]: false,
        },
        itemId: {
          [MOCK_STORES[0].name]: 'itemId1',
          [MOCK_STORES[1].name]: 'itemId2',
        },
        note: {
          [MOCK_STORES[0].name]: 'Note',
        },
        price: {
          [MOCK_STORES[0].name]: 10.99,
          [MOCK_STORES[1].name]: 1.99,
        },
        quantity: {
          [MOCK_STORES[0].name]: 1,
          [MOCK_STORES[1].name]: 2,
        },
      },
      [MOCK_UPCS[1]]: {
        aisleNumber: {
          [MOCK_STORES[0].name]: 10,
          [MOCK_STORES[1].name]: 1000,
        },
        isInCart: {
          [MOCK_STORES[0].name]: true,
          [MOCK_STORES[1].name]: false,
        },
        itemId: {
          [MOCK_STORES[0].name]: 'itemId3',
          [MOCK_STORES[1].name]: 'itemId4',
        },
        note: {
          [MOCK_STORES[0].name]: 'Note',
        },
        price: {
          [MOCK_STORES[0].name]: 10.99,
          [MOCK_STORES[1].name]: 1.99,
        },
        quantity: {
          [MOCK_STORES[0].name]: 1,
          [MOCK_STORES[1].name]: 2,
        },
      },
    } as StoreSpecificValuesMap;
    const actual = getLastPurchasedFromStoreSpecificValues(
      mockStoreSpecificValues,
      MOCK_STORES[0].name,
    );
    const now = Date.now();
    const actualTimeOne = actual?.[MOCK_UPCS[0]]?.[
      MOCK_STORES[0].name
    ] as number;
    const actualTimeTwo = actual?.[MOCK_UPCS[1]]?.[
      MOCK_STORES[0].name
    ] as number;
    expect(actualTimeOne - now).toBeLessThan(maxAllowedTimeDiff);
    expect(actualTimeTwo - now).toBeLessThan(maxAllowedTimeDiff);
  });
});
