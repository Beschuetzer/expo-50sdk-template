import AsyncStorage from "@react-native-async-storage/async-storage";

import { EMPTY_STRING } from "@/constants/general";
import { Item } from "@/types/Item";
import { UpcProduct } from "@/types/UpcResponse";

export async function getItem(input: UpcProduct): Promise<Item> {
  return {
    frequency: 0,
    imageUri: {
      url: input.image_front_thumb_url || input.image_thumb_url || EMPTY_STRING,
      location:
        (await AsyncStorage.getItem(input.code || EMPTY_STRING)) ||
        EMPTY_STRING,
    },
    name: input.product_name,
    upc: input.code || input.id,
  };
}
