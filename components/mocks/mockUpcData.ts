import { UpcProduct, UpcResponse } from '@/types/UpcResponse';
import { delay } from '@/utils/helpers';

export const MOCKS_UPCS = [
  '096619107698',
  '043000054017',
  '072273487253',
  '072273487254',
];

export async function handleMockResponse(upc: string) {
  await delay(1000);
  const MOCKS = {
    [MOCKS_UPCS[0]]: {
      code: MOCKS_UPCS[0],
      status: 1,
      status_verbose: 'worked',
      product: {
        brands: 'Kirkland Signature',
        code: MOCKS_UPCS[0],
        id: MOCKS_UPCS[0],
        image_front_small_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.200.jpg',
        image_front_thumb_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.100.jpg',
        image_front_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.400.jpg',
        image_ingredients_small_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.200.jpg',
        image_ingredients_thumb_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.100.jpg',
        image_ingredients_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.400.jpg',
        image_nutrition_small_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.200.jpg',
        image_nutrition_thumb_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.100.jpg',
        image_nutrition_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.400.jpg',
        image_small_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.200.jpg',
        image_thumb_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.100.jpg',
        image_url:
          'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.400.jpg',
        product_name: 'Shelled Pistachios',
      } as UpcProduct,
    },
    [MOCKS_UPCS[1]]: {
      code: MOCKS_UPCS[1],
      status: 1,
      status_verbose: 'worked',
      product: {
        code: MOCKS_UPCS[1],
        id: MOCKS_UPCS[1],
        image_front_small_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.200.jpg',
        image_front_thumb_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg',
        image_front_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.400.jpg',
        image_ingredients_small_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.200.jpg',
        image_ingredients_thumb_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.100.jpg',
        image_ingredients_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.400.jpg',
        image_nutrition_small_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.200.jpg',
        image_nutrition_thumb_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.100.jpg',
        image_nutrition_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.400.jpg',
        image_small_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.200.jpg',
        image_thumb_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg',
        image_url:
          'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.400.jpg',
        product_name: 'Chocolate',
        brands: 'Some Company LLC.',
      } as UpcProduct,
    },
    [MOCKS_UPCS[2]]: {
      code: MOCKS_UPCS[2],
      status: 1,
      status_verbose: 'worked',
      product: {
        brands: 'SW,Del Monte Foods',
        code: MOCKS_UPCS[2],
        id: MOCKS_UPCS[2],
        product_name: 'Beans',
        image_front_small_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.200.jpg',
        image_front_thumb_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.100.jpg',
        image_front_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.400.jpg',
        image_ingredients_small_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.200.jpg',
        image_ingredients_thumb_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.100.jpg',
        image_ingredients_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.400.jpg',
        image_nutrition_small_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.200.jpg',
        image_nutrition_thumb_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.100.jpg',
        image_nutrition_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.400.jpg',
        image_small_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.200.jpg',
        image_thumb_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.100.jpg',
        image_url:
          'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.400.jpg',
      },
    },
  } as unknown as { [key: string]: UpcResponse };
  const toReturn = MOCKS?.[upc] || {
    data: {
      code: upc,
      status: 0,
      status_verbose: 'product not found',
    },
  };
  console.log({ toReturn, upc });

  return new Response(JSON.stringify(toReturn));
}
