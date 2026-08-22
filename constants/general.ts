import * as Haptics from 'expo-haptics';

import { SortOrder, SortType } from '@/components/lists/sorters';
import {
  ItemUnit,
  StoreSpecificValueKey,
  StoreSpecificValueKeyTypes,
} from '@/types/Item';
import { GpsCoordinate } from '@/types/Store';
import { UpcProduct } from '@/types/UpcResponse';
import { Duration, TimeSpan } from '@/types/general';
import { SortOrderValue } from '@/types/listSlice';

export const EMPTY_NUMBER = 0;
export const EMPTY_STRING = '';
export const NOT_APPLICABLE_STRING = 'N/A';
export const ADDRESS_INITIAL = Object.freeze({
  addressLineOne: EMPTY_STRING,
  addressLineTwo: EMPTY_STRING,
  city: EMPTY_STRING,
  country: EMPTY_STRING,
  state: EMPTY_STRING,
  zipCode: EMPTY_STRING,
});
export const APP_NAME = 'Grocify';
export const AUTO_SAVE_ITEMS_INITIAL = false;
export const AUTO_SAVE_STORES_INITIAL = false;
export const AUTO_SAVE_DEBOUNCE_THRESHOLD = 500;
export const AUTO_SET_STORE_DISTANCE_THRESHOLD_INITIAL = 0.25;
export const AUTO_SET_STORE_WHEN_CLOSE_ENOUGH_INITIAL = true;
export const BFF_SERVICE_ABORT_TIMEOUT = 10000;
export const CAN_OVERRIDE_DEFAULT = false;
export const DEFAULT_IMAGE_INDEX = 0;
export const DURATION_INITIAL_NUMBER = 1;
export const DURATION_INITIAL_TIME_SPAN = TimeSpan.Week;
export const DURATION_INITIAL = Object.freeze({
  number: DURATION_INITIAL_NUMBER,
  timeSpan: DURATION_INITIAL_TIME_SPAN,
} as Duration);
export const ERROR_MODAL_STATUS_CODE_DEFAULT = 500;
export const ESTIMATED_SIZE_FOR_ITEMS_LIST = 108;
export const ESTIMATED_SIZE_FOR_QUICK_ADD_MODAL_SEARCH_LIST = 117;
export const ESTIMATED_SIZE_FOR_SHOPPING_LISTS = 133;
export const ESTIMATED_SIZE_FOR_STORE_SELECTION_MODAL = 44;
export const ESTIMATED_SIZE_FOR_LOCATION_SELECTION_MODAL = 44;
export const ESTIMATED_SIZE_FOR_ROUTE_LOCATION_SEARCH_MODAL = 48;
export const ESTIMATED_SIZE_FOR_STORES_LIST = 61;
export const FILE_NAMES = {
  inventory: 'inventory',
  items: 'items',
  lastPurchasedMap: 'lastPurchasedMap',
  mutuallyExclusiveGroups: 'mutuallyExclusiveGroups',
  returnItems: 'returnItems',
  stores: 'stores',
  storeSpecificValues: 'storeSpecificValues',
};
export const FORM_INTER_ITEM_SPACING = 0.5;
export const GPS_COORDINATES_DEFAULT = Object.freeze({
  lat: EMPTY_STRING,
  lon: EMPTY_STRING,
} as GpsCoordinate);
export const HEADER_BUTTON_SIZE_DEFAULT = 8;
export const HOUR_IN_MS = 1000 * 60 * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;
export const WEEK_IN_MS = DAY_IN_MS * 7;
export const MONTH_IN_MS = DAY_IN_MS * 30;
export const YEAR_IN_MS = DAY_IN_MS * 365;
export const IMAGE_ROLL_LOCATION = 'file:///storage/emulated/0/Pictures';
export const IMAGE_RENDERER_TITLE_DEFAULT = 'Image Viewer';
export const IMAGE_RENDERER_SHOW_FULL_SCREEN_ON_PRESS_DEFAULT = true;
export const IMAGE_RENDERER_WIDTH_DEFAULT = 60;
export const IMAGE_RENDERER_ASPECT_RATIO_DEFAULT = 1.5;
export const IMAGE_QUALITY = 0.25;
export const MAX_CUSTOM_IMAGES = 3;
export const MAX_COOKING_INSTRUCTION_IMAGES = 1;
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
export const ITEM_UNIT_INITIAL = ItemUnit.Package;
export const INVENTORY_MINIMUM_DEFAULT = 0;
export const IS_FROZEN_DEFAULT = false;
export const LIST_HAPTICS = {
  handleIsSelected: (isSelected: boolean) => () => {
    if (isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  handleMultipleItemSelect: (isMultiSelectEnabled: boolean) => () => {
    if (isMultiSelectEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  handleSelection: () => {
    Haptics.selectionAsync();
  },
  handleSwipeItem:
    (isRemoving = false) =>
    () => {
      if (isRemoving) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
};
export const NAME_ORDER_BRANDS_STRING = 'brands';
export const NAME_ORDER_PRODUCT_NAME_STRING = 'product_name';
export const NAME_ORDER_TEMPLATE_INITIAL = `${NAME_ORDER_PRODUCT_NAME_STRING} (${NAME_ORDER_BRANDS_STRING})`;
export const QUANTITY_ROW_DEFAULT = 1;
export const SAVE_IMAGES_TO_GALLERY_INITIAL = false;
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
export const TEST_EMAIL = 'test@test.com';
export const TIME_SPAN_TO_MILLISECONDS_MAPPING: { [key in TimeSpan]: number } =
  {
    [TimeSpan.Hour]: HOUR_IN_MS,
    [TimeSpan.Day]: DAY_IN_MS,
    [TimeSpan.Week]: WEEK_IN_MS,
    [TimeSpan.Month]: MONTH_IN_MS,
    [TimeSpan.Year]: YEAR_IN_MS,
  };
export const TIME_TO_EXPIRATION_DEFAULT = 1000 * 60 * 60 * 24 * 14; // 7 days
export const TYPING_DEBOUNCE_THRESHOLD = 333;
export const US_COUNTRY_CODE = 'US';
export const UUID_NAME_SPACE = 'f5250e05-c053-4863-9686-a0f045ae566d';
export const VALID_COUNTRY_CODES = [
  'AF',
  'AX',
  'AL',
  'DZ',
  'AS',
  'AD',
  'AO',
  'AI',
  'AQ',
  'AG',
  'AR',
  'AM',
  'AW',
  'AU',
  'AT',
  'AZ',
  'BS',
  'BH',
  'BD',
  'BB',
  'BY',
  'BE',
  'BZ',
  'BJ',
  'BM',
  'BT',
  'BO',
  'BQ',
  'BA',
  'BW',
  'BV',
  'BR',
  'IO',
  'BN',
  'BG',
  'BF',
  'BI',
  'CV',
  'KH',
  'CM',
  'CA',
  'KY',
  'CF',
  'TD',
  'CL',
  'CN',
  'CX',
  'CC',
  'CO',
  'KM',
  'CG',
  'CD',
  'CK',
  'CR',
  'HR',
  'CU',
  'CW',
  'CY',
  'CZ',
  'DK',
  'DJ',
  'DM',
  'DO',
  'EC',
  'EG',
  'SV',
  'GQ',
  'ER',
  'EE',
  'SZ',
  'ET',
  'FK',
  'FO',
  'FJ',
  'FI',
  'FR',
  'GF',
  'PF',
  'TF',
  'GA',
  'GM',
  'GE',
  'DE',
  'GH',
  'GI',
  'GR',
  'GL',
  'GD',
  'GP',
  'GU',
  'GT',
  'GG',
  'GN',
  'GW',
  'GY',
  'HT',
  'HM',
  'VA',
  'HN',
  'HK',
  'HU',
  'IS',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IE',
  'IM',
  'IL',
  'IT',
  'JM',
  'JP',
  'JE',
  'JO',
  'KZ',
  'KE',
  'KI',
  'KP',
  'KR',
  'KW',
  'KG',
  'LA',
  'LV',
  'LB',
  'LS',
  'LR',
  'LY',
  'LI',
  'LT',
  'LU',
  'MO',
  'MG',
  'MW',
  'MY',
  'MV',
  'ML',
  'MT',
  'MH',
  'MQ',
  'MR',
  'MU',
  'YT',
  'MX',
  'FM',
  'MD',
  'MC',
  'MN',
  'ME',
  'MS',
  'MA',
  'MZ',
  'MM',
  'NA',
  'NR',
  'NP',
  'NL',
  'NC',
  'NZ',
  'NI',
  'NE',
  'NG',
  'NU',
  'NF',
  'MK',
  'MP',
  'NO',
  'OM',
  'PK',
  'PW',
  'PS',
  'PA',
  'PG',
  'PY',
  'PE',
  'PH',
  'PN',
  'PL',
  'PT',
  'PR',
  'QA',
  'RE',
  'RO',
  'RU',
  'RW',
  'BL',
  'SH',
  'KN',
  'LC',
  'MF',
  'PM',
  'VC',
  'WS',
  'SM',
  'ST',
  'SA',
  'SN',
  'RS',
  'SC',
  'SL',
  'SG',
  'SX',
  'SK',
  'SI',
  'SB',
  'SO',
  'ZA',
  'GS',
  'SS',
  'ES',
  'LK',
  'SD',
  'SR',
  'SJ',
  'SE',
  'CH',
  'SY',
  'TW',
  'TJ',
  'TZ',
  'TH',
  'TL',
  'TG',
  'TK',
  'TO',
  'TT',
  'TN',
  'TR',
  'TM',
  'TC',
  'TV',
  'UG',
  'UA',
  'AE',
  'GB',
  'US',
  'UM',
  'UY',
  'UZ',
  'VU',
  'VE',
  'VN',
  'VG',
  'VI',
  'WF',
  'EH',
  'YE',
  'ZM',
  'ZW',
];

export const STORE_SPECIFIC_VALUE_KEY_DEFAULTS: StoreSpecificValueKeyTypes = {
  [StoreSpecificValueKey.AisleNumber]: EMPTY_NUMBER,
  [StoreSpecificValueKey.IsInCart]: false,
  [StoreSpecificValueKey.ItemId]: EMPTY_STRING,
  [StoreSpecificValueKey.Location]: EMPTY_STRING,
  [StoreSpecificValueKey.Note]: EMPTY_STRING,
  [StoreSpecificValueKey.Price]: EMPTY_NUMBER,
  [StoreSpecificValueKey.Quantity]: EMPTY_NUMBER,
};
