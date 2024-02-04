import { TimeSpan } from "@/types/general";

export const EMPTY_STRING = "";
const HOUR_IN_MS = 1000 * 60 * 60
export const TIME_SPAN_TO_MILLISECONDS_MAPPING: { [key in TimeSpan]: number } =
  {
    Hour: HOUR_IN_MS,
    Day: HOUR_IN_MS * 24,
    Week: HOUR_IN_MS * 24 * 7,
  };