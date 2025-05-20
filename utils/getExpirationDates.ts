import { InventoryItemExpirationDates } from '@/types/inventory';

export function getExpirationDates(
  values: (string | number)[],
): InventoryItemExpirationDates {
  return values.reduce((acc, value) => {
    if (value == null) return acc;
    const now = Date.now();
    const parsedIntValue = parseInt(value as string, 10);
    const parsedDateValue =
      isNaN(parsedIntValue) || parsedIntValue < now
        ? new Date(value)?.getTime()
        : parsedIntValue;

    if (!parsedDateValue || isNaN(parsedDateValue) || parsedDateValue < 0) {
      return acc; // Skip invalid timestamps
    }

    if (acc[parsedDateValue]) {
      acc[parsedDateValue] += 1;
    } else {
      acc[parsedDateValue] = 1;
    }
    return acc;
  }, {} as InventoryItemExpirationDates);
}
