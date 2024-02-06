import { EMPTY_FREQUENCY, EMPTY_STRING } from "@/constants/general";
import { Item } from "@/types/Item";
import { UpcProduct } from "@/types/UpcResponse";

export async function getItem(input: UpcProduct): Promise<Item> {
  return {
    frequency: EMPTY_FREQUENCY,
    imageUri:
      input.image_front_thumb_url || input.image_thumb_url || EMPTY_STRING,
    name: input.product_name,
    upc: input.code || input.id,
  };
}
