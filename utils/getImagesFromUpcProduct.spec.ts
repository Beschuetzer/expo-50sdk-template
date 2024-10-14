import { getImagesFromUpcProduct } from './getImagesFromUpcProducts';

import { MOCK_UPC_PRODUCTS, MOCK_UPCS } from '@/components/mocks/constants';
import { UpcProduct } from '@/types/UpcResponse';

describe('getImagesFromUpcProduct', () => {
  it('removes duplicates', async () => {
    const upcResponse = MOCK_UPC_PRODUCTS[MOCK_UPCS[0]];
    const actual = getImagesFromUpcProduct(upcResponse.product);
    expect(actual).toStrictEqual([
      'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.100.jpg',
      'https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.100.jpg',
      'https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.100.jpg',
    ]);
  });
  it('removes duplicates two', async () => {
    const upcResponse = MOCK_UPC_PRODUCTS[MOCK_UPCS[1]];
    const actual = getImagesFromUpcProduct(upcResponse.product);
    expect(actual).toStrictEqual([
      'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg',
      'https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.100.jpg',
      'https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.100.jpg',
    ]);
  });
  it('removes duplicates three', async () => {
    const upcResponse = MOCK_UPC_PRODUCTS[MOCK_UPCS[2]];
    const actual = getImagesFromUpcProduct(upcResponse.product);
    expect(actual).toStrictEqual([
      'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.100.jpg',
      'https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.100.jpg',
      'https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.100.jpg',
    ]);
  });
  it('is empty when no values given', async () => {
    const actual = getImagesFromUpcProduct({} as UpcProduct);
    expect(actual).toStrictEqual([]);
  });
});
