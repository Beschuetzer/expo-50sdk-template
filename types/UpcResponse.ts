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
  _id: string;
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
  product_name: string;
};
