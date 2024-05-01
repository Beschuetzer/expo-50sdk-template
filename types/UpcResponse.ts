import {
  NAME_ORDER_BRANDS_STRING,
  NAME_ORDER_PRODUCT_NAME_STRING,
} from '@/constants/general';

/**
 *There are many more fields, just using the relevant ones for now.
 *See {@link https://world.openfoodfacts.org/api/v0/product/072273487253 this}.
 **/
export type UpcResponse = {
  code: number;
  product: UpcProduct;
  status: number;
  status_verbose: string;
};

export type UpcProduct = {
  [NAME_ORDER_BRANDS_STRING]?: string;
  code?: string;
  id?: string;
  image_front_small_url?: string;
  image_front_thumb_url?: string;
  image_front_url?: string;
  image_ingredients_small_url?: string;
  image_ingredients_thumb_url?: string;
  image_ingredients_url?: string;
  image_nutrition_small_url?: string;
  image_nutrition_thumb_url?: string;
  image_nutrition_url?: string;
  image_small_url?: string;
  image_thumb_url?: string;
  image_url?: string;
  [NAME_ORDER_PRODUCT_NAME_STRING]: string;
};
