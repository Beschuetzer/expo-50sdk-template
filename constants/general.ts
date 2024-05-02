import { SortOrder, SortType } from '@/components/lists/sorters';
import { SortOrderValue } from '@/state/slices/listsSlice';
import { ItemUnit } from '@/types/Item';
import { GpsCoordinate } from '@/types/Store';
import { UpcProduct } from '@/types/UpcResponse';
import { Frequency, TimeSpan } from '@/types/general';

export const AUTO_SAVE_INITIAL = true;
export const AUTO_SAVE_DEBOUNCE_THRESHOLD = 500;
export const AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL = 0.25;
export const AUTO_SET_STORE_WHEN_CLOSE_ENOUGH_INITIAL = true;
export const CAN_OVERRIDE_DEFAULT = false;
export const DEFAULT_IMAGE_INDEX = 0;
export const EMPTY_NUMBER = 0;
export const EMPTY_STRING = '';
export const ESTIMATED_SIZE_FOR_ITEMS_LIST = 108;
export const ESTIMATED_SIZE_FOR_SHOPPING_LISTS = 133;
export const ESTIMATED_SIZE_FOR_STORES_LIST = 61;
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
export const IMAGE_RENDERER_TITLE_DEFAULT = 'Image Viewer';
export const IMAGE_RENDERER_SHOW_FULL_SCREEN_ON_PRESS_DEFAULT = true;
export const IMAGE_RENDERER_WIDTH_DEFAULT = 60;
export const IMAGE_RENDERER_ASPECT_RATIO_DEFAULT = 1.5;
export const IMAGE_PICKER_QUALITY_INITIAL = 0.25;
export const IMAGE_PRIORITY_MAPPING: {
  [key: number | string]: keyof UpcProduct;
} = {
  0: 'image_front_thumb_url',
  1: 'image_thumb_url',
  2: 'image_ingredients_thumb_url',
  3: 'image_nutrition_thumb_url',
};
export const ITEM_TILE_WIDTH = 30;
export const ITEM_TILE_ICON_SIZE = 5;
export const NAME_ORDER_BRANDS_STRING = 'brands';
export const NAME_ORDER_PRODUCT_NAME_STRING = 'product_name';
export const NAME_ORDER_TEMPLATE_INITIAL = `${NAME_ORDER_PRODUCT_NAME_STRING} (${NAME_ORDER_BRANDS_STRING})`;
export const SORT_ORDER_VALUE_BY_NAME_DEFAULT: SortOrderValue = Object.freeze({
  sortOrder: SortOrder.Ascending,
  sortBy: SortType.Name,
});
export const SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT: SortOrderValue =
  Object.freeze({
    sortOrder: SortOrder.Ascending,
    sortBy: SortType.AisleNumber,
  });
export const SWIPEABLE_ROW_OPEN_THRESHOLD_DEFAULT = 100;
export const TIME_SPAN_TO_MILLISECONDS_MAPPING: { [key in TimeSpan]: number } =
  {
    [TimeSpan.Hour]: HOUR_IN_MS,
    [TimeSpan.Day]: DAY_IN_MS,
    [TimeSpan.Week]: WEEK_IN_MS,
  };
export const UNIT_INITIAL = ItemUnit.Package;
