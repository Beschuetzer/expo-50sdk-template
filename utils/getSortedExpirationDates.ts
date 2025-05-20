import { SortOrder } from '@/components/lists/sorters';
import { InventoryItemExpirationDates } from '@/types/inventory';

export const getSortedExpirationDates = (
  expirationDates: InventoryItemExpirationDates,
  sortOrder: SortOrder = SortOrder.Ascending,
) => {
  return Object.entries(expirationDates || {}).sort((a, b) => {
    const comparison = Number(a[0]) - Number(b[0]);
    return sortOrder === SortOrder.Ascending ? comparison : -comparison;
  });
};
