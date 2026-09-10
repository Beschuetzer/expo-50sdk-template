import {
  DURATION_INITIAL,
  DURATION_INITIAL_NUMBER,
  EMPTY_NUMBER,
  EMPTY_STRING,
  HOUR_IN_MS,
  DAY_IN_MS,
  MONTH_IN_MS,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
  WEEK_IN_MS,
  YEAR_IN_MS,
} from '@/constants/general';
import { AMAZON_S3_REGEX } from '@/constants/regexs';
import { Key } from '@/types/Task';
import { Address, Duration, State, TimeSpan } from '@/types/general';

export function camelCaseToSpacedCapitalized(str: string) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

export function ensureMaxLength(str: string, maxLength: number) {
  if (!str) return EMPTY_STRING;
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function getAddressString(
  address: Address | null,
  includePreposition = false,
) {
  const cityToUse = address?.city ? ` ${address.city}` : EMPTY_STRING;
  const stateToUse =
    address?.state !== State.None ? ` ${address?.state}` : EMPTY_STRING;
  const zipToUse = address?.zipCode ? ` ${address.zipCode}` : EMPTY_STRING;
  const separatingComma = cityToUse && stateToUse ? ', ' : EMPTY_STRING;
  const preposition = cityToUse || stateToUse ? 'in' : 'at';
  const prepositionString = includePreposition
    ? `${preposition} `
    : EMPTY_STRING;

  return `${prepositionString}${cityToUse.trim()}${separatingComma}${stateToUse.trim()}${zipToUse}`.replaceAll(
    '  ',
    ' ',
  );
}

export function getKeyToUse(key: string | Key, displayAlertOnMissing = false) {
  if (typeof key === 'string') return key;
  const sanitizedKey = sanitizeKey(key);
  const toReturn =
    sanitizedKey?._id || sanitizedKey?.code || sanitizedKey?.title || EMPTY_STRING;

  if (!toReturn && displayAlertOnMissing) {
    alert(
      'No key given.  Please delete the task in question and ensure there is either a title or code given.',
    );
  }

  return toReturn;
}

export function getDurationInMilliseconds(duration?: Duration) {
  return (
    (duration?.number || EMPTY_NUMBER) *
    TIME_SPAN_TO_MILLISECONDS_MAPPING?.[duration?.timeSpan || TimeSpan.Hour]
  );
}

export function getDurationValue(number?: number): Duration {
  if (!number) return { ...DURATION_INITIAL };

  let numberToUse = DURATION_INITIAL.number;
  let timeSpan: TimeSpan = DURATION_INITIAL.timeSpan;

  if (number % YEAR_IN_MS === 0) {
    numberToUse = number / YEAR_IN_MS;
    timeSpan = TimeSpan.Year;
  } else if (number % MONTH_IN_MS === 0) {
    numberToUse = number / MONTH_IN_MS;
    timeSpan = TimeSpan.Month;
  } else if (number % WEEK_IN_MS === 0) {
    numberToUse = number / WEEK_IN_MS;
    timeSpan = TimeSpan.Week;
  } else if (number % DAY_IN_MS === 0) {
    numberToUse = number / DAY_IN_MS;
    timeSpan = TimeSpan.Day;
  } else {
    numberToUse = Math.ceil(number / HOUR_IN_MS);
    timeSpan = TimeSpan.Hour;
  }

  return {
    number: numberToUse,
    timeSpan,
  };
}

export function getS3ObjectKey(url: string) {
  try {
    if (!url) return EMPTY_STRING;
    let urlToUse = url;
    if (!url.match(/http/)) {
      urlToUse = `https://${url}`;
    }
    const objKey = new URL(urlToUse)?.pathname?.substring(1);
    return objKey || EMPTY_STRING;
  } catch {
    return EMPTY_STRING;
  }
}

export function getS3Images(images: string[]) {
  if (!images || images.length === 0) return [];
  return images.filter((image) => image.match(AMAZON_S3_REGEX));
}

export function getStateFromString(stateStr?: string): State {
  if (!stateStr) return State.None;
  if (Object.values(State).includes(stateStr as State)) {
    return stateStr as State;
  }
  const value = State[stateStr as keyof typeof State];
  return value ? value : State.None;
}

export function joinWithAnd(array: (string | undefined)[]) {
  if (array.length === 0) {
    return '';
  } else if (array.length === 1) {
    return array[0];
  } else if (array.length === 2) {
    return array.join(' and ');
  } else {
    const lastItem = array.pop();
    return array.join(', ') + ', and ' + lastItem;
  }
}

export function sanitizeKey<T extends Key>(key: T) {
  const copy = { ...key };
  if (copy?.title) {
    copy.title = sanitize(copy.title);
  }
  if (copy?.code) {
    copy.code = sanitize(copy.code);
  }
  return copy;
}

export function sanitize(str?: string) {
  if (!str) return EMPTY_STRING;
  return str.replace(/\./g, '');
}

export function trimObjectValues<T extends Record<string, any>>(obj: T) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      (obj as any)[key] = value.trim();
    }
  }
  return obj as T;
}

export const DURATION_INITIAL_NUMBER_TO_USE = DURATION_INITIAL_NUMBER;
export const HOUR_IN_MS_TO_USE = HOUR_IN_MS;
export const DAY_IN_MS_TO_USE = DAY_IN_MS;
export const WEEK_IN_MS_TO_USE = WEEK_IN_MS;
export const MONTH_IN_MS_TO_USE = MONTH_IN_MS;
export const YEAR_IN_MS_TO_USE = YEAR_IN_MS;

export const TIME_SPAN_TO_MILLISECONDS_MAPPING_TO_USE =
  TIME_SPAN_TO_MILLISECONDS_MAPPING;
