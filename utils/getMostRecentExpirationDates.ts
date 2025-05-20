import { getSorter, SortType } from '@/components/lists/sorters';
import { InventoryItemExpirationDates } from '@/types/inventory';

export function getMostRecentExpirationDates(
  expirationDates?: InventoryItemExpirationDates,
  numberToGet?: number,
): InventoryItemExpirationDates {
  if (!expirationDates || numberToGet == null || numberToGet <= 0) return {};

  // Get the expiration keys (assumed to be timestamp strings) sorted in ascending order
  const sortedKeys = Object.keys(expirationDates).sort(
    getSorter({ sortType: SortType.Distance }),
  );

  const result: InventoryItemExpirationDates = {};
  let cumulative = 0;

  for (const key of sortedKeys) {
    const quantity = expirationDates[key];
    if (quantity == null || quantity <= 0) continue; // Skip invalid quantities
    if (cumulative + quantity < numberToGet) {
      // Add the full quantity for this expiration date.
      result[key] = quantity;
      cumulative += quantity;
    } else if (cumulative < numberToGet) {
      // Only add as many as needed to reach numberToGet.
      result[key] = numberToGet - cumulative;
      cumulative = numberToGet;
      break; // We've reached the required total.
    } else {
      break;
    }
  }

  return result;
}
