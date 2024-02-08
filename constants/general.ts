import { UpcProduct } from "@/types/UpcResponse";
import { TimeSpan } from "@/types/general";

export const DEFAULT_IMAGE_INDEX = 0;
export const EMPTY_FREQUENCY = 0;
export const EMPTY_STRING = "";
const HOUR_IN_MS = 1000 * 60 * 60;

export const IMAGE_PRIORITY_MAPPING: {
  [key: number | string]: keyof UpcProduct;
} = {
  0: "image_front_thumb_url",
  1: "image_thumb_url",
  2: "image_ingredients_thumb_url",
  3: "image_nutrition_thumb_url",
};
export const TIME_SPAN_TO_MILLISECONDS_MAPPING: { [key in TimeSpan]: number } =
  {
    Hour: HOUR_IN_MS,
    Day: HOUR_IN_MS * 24,
    Week: HOUR_IN_MS * 24 * 7,
  };
