import * as Haptics from 'expo-haptics';

import {
  SortOrder,
  SortType,
  SortOrderValue,
} from '@/components/lists/sorters';
import { TaskPriority } from '@/types/Task';
import { Duration, GpsCoordinate, TimeSpan } from '@/types/general';

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
export const APP_NAME = 'Expo SDK 50 Template';
export const AUTO_SAVE_DEBOUNCE_THRESHOLD = 500;
export const AUTO_SAVE_INITIAL = false;
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
export const ESTIMATED_SIZE_FOR_TASKS_LIST = 108;
export const ESTIMATED_SIZE_FOR_TASK_SEARCH_MODAL_LIST = 117;
export const FILE_NAMES = {
  tasks: 'tasks',
};
export const FORM_INTER_ITEM_SPACING = 0.5;
export const GPS_COORDINATES_DEFAULT = Object.freeze({
  lat: EMPTY_STRING,
  lon: EMPTY_STRING,
} as GpsCoordinate);
export const HEADER_BUTTON_SIZE_DEFAULT = 24;
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
export const TASK_TILE_ICON_SIZE = 5;
export const TASK_PRIORITY_INITIAL = TaskPriority.Medium;
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
export const QUANTITY_ROW_DEFAULT = 1;
export const SAVE_IMAGES_TO_GALLERY_INITIAL = false;
export const SORT_ORDER_VALUE_DEFAULT: SortOrderValue = Object.freeze({
  sortOrder: SortOrder.Ascending,
  sortBy: SortType.Title,
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
