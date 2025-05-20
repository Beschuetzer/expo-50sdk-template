import { InventoryItemExpirationDates } from '@/types/inventory';

export function getExpirationDatesQuantity(
  expirationDates?: InventoryItemExpirationDates,
): number {
  return Object.entries(expirationDates || {}).reduce((acc, [key, value]) => {
    if (key && value && value > 0) {
      return acc + value;
    }
    return acc;
  }, 0);
}
