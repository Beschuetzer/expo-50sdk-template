import * as ImagePicker from "expo-image-picker";

import { ItemUnit } from "@/types/Item";
import { GpsCoordinate } from "@/types/Store";
import { UpcProduct } from "@/types/UpcResponse";
import { Frequency, TimeSpan } from "@/types/general";

export const DEFAULT_IMAGE_INDEX = 0;
export const EMPTY_NUMBER = 0;
export const EMPTY_STRING = "";
export const FORM_INTER_ITEM_SPACING = 0.5;
export const FREQUENCY_INITIAL = Object.freeze({
  number: 1,
  timeSpan: TimeSpan.Week,
} as Frequency);
export const GPS_COORDINATES_DEFAULT = Object.freeze({
  lat: EMPTY_STRING,
  lon: EMPTY_STRING,
} as GpsCoordinate);
export const HOUR_IN_MS = 1000 * 60 * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;
export const WEEK_IN_MS = DAY_IN_MS * 7;
export const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0,
  selectionLimit: 1,
} as ImagePicker.ImagePickerOptions;
export const IMAGE_PRIORITY_MAPPING: {
  [key: number | string]: keyof UpcProduct;
} = {
  0: "image_front_thumb_url",
  1: "image_thumb_url",
  2: "image_ingredients_thumb_url",
  3: "image_nutrition_thumb_url",
};
export const SWIPEABLE_ROW_OPEN_THRESHOLD = 100;
export const TIME_SPAN_TO_MILLISECONDS_MAPPING: { [key in TimeSpan]: number } =
  {
    [TimeSpan.Hour]: HOUR_IN_MS,
    [TimeSpan.Day]: DAY_IN_MS,
    [TimeSpan.Week]: WEEK_IN_MS,
  };
export const UNIT_INITIAL = ItemUnit.Package;
