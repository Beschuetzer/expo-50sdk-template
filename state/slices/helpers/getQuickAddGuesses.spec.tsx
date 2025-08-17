import { getQuickAddGuesses } from './getQuickAddGuesses';

import { MOCK_ITEMS_LIST } from '@/components/mocks/itemsList';
import { MOCK_PROCESSED_GROCERY_LIST } from '@/components/mocks/processedGroceryList';
import { ProcessedGroceryList } from '@/types/bffService';

function getMockItemData(id: string, quantity: number) {
  return [MOCK_ITEMS_LIST.data.find((item) => item._id === id), quantity];
}

describe('getQuickAddGuesses', () => {
  test('All', () => {
    const actual = getQuickAddGuesses(
      MOCK_ITEMS_LIST.data as any, // data items already conform to Item type with inventoryMinimum
      MOCK_PROCESSED_GROCERY_LIST,
    );
    expect(actual).toStrictEqual({
      blueberries: [
        getMockItemData('696901ec-5eaf-4498-9c13-793c641f9282', 32),
        getMockItemData('a0ba99c7-a9ea-4ebc-b02b-5e8735a6be12', 14),
      ],
      pizza: [getMockItemData('78d725e8-c4cc-4a48-b40d-0be3f7f9952d', 30)],
      'pulled pork': [
        getMockItemData('d5792b79-f79d-473f-91ba-8bd85ae88ef4', 14),
      ],
      salad: [
        getMockItemData('cc6759fa-02b7-4082-8d46-6235737e9fa4', 25),
        getMockItemData('cc6759fa-02b7-4082-8d46-6235737e0fb3', 18),
      ],
      'salmon burger': [
        getMockItemData('1f62daf7-06f7-46fe-93dc-2e7bed90635f', 26),
      ],
      'veggie juice': [
        getMockItemData('bd04aa8a-877d-4aa6-86df-3713c21dde84', 19),
        getMockItemData('0d583d42-10af-4005-b6db-5ab336a38994', 17),
        getMockItemData('20bf8d35-2a1e-4f60-957e-50a375637f8f', 13),
        getMockItemData('e6d105e5-1c71-4197-8f60-3b987cf8bc9a', 7),
        getMockItemData('d503609d-fe6f-4a4c-8daf-24104cc23a4a', 4),
      ],
      water: [
        getMockItemData('fe4470f4-1714-4d7c-89c7-5275447173b3', 43),
        getMockItemData('cf00df86-711d-439e-95ca-af0647de237e', 38),
        getMockItemData('13a5be7b-52e5-4f31-bdf2-35f8c24217d0', 25),
        getMockItemData('150e4fcb-f43f-4e97-acd8-7c4f5211f84d', 22),
        getMockItemData('4e828277-86a5-499b-aaaa-04b9825b0517', 17),
      ],
    });
  });

  describe('Variations', () => {
    test('One word that matches', () => {
      const actual = getQuickAddGuesses(
        MOCK_ITEMS_LIST.data as any,
        {
          store: 'Costco',
          items: [['salmon', 2, 'unit']],
        } as ProcessedGroceryList,
      );
      expect(actual).toStrictEqual({
        salmon: [
          getMockItemData('1f62daf7-06f7-46fe-93dc-2e7bed90635f', 23),
          getMockItemData('19fb090e-70f3-453c-8123-6b50aad999e0', 18),
        ],
      });
    });
    test('One word and partial of another', () => {
      const actual = getQuickAddGuesses(
        MOCK_ITEMS_LIST.data as any,
        {
          store: 'Costco',
          items: [['salmon burger', 2, 'unit']],
        } as ProcessedGroceryList,
      );
      expect(actual).toStrictEqual({
        'salmon burger': [
          getMockItemData('1f62daf7-06f7-46fe-93dc-2e7bed90635f', 26),
        ],
      });
    });
    test('One word and one with no match', () => {
      const actual = getQuickAddGuesses(
        MOCK_ITEMS_LIST.data as any,
        {
          store: 'Costco',
          items: [['salmon patty', 2, 'unit']],
        } as ProcessedGroceryList,
      );
      expect(actual).toStrictEqual({
        'salmon patty': [
          getMockItemData('1f62daf7-06f7-46fe-93dc-2e7bed90635f', 8),
          getMockItemData('19fb090e-70f3-453c-8123-6b50aad999e0', 6),
        ],
      });
    });
  });
});
