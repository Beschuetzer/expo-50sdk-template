import { InventoryItemExpirationDates } from '@/types/inventory';

export function getUpdatedExpirationDates(
  expirationDatesOriginal: InventoryItemExpirationDates,
  expirationDatesToUpdateWith: InventoryItemExpirationDates,
  method: 'add' | 'remove',
): InventoryItemExpirationDates {
  if (!expirationDatesOriginal || !expirationDatesToUpdateWith) {
    return expirationDatesOriginal;
  }
  const updatedExpirationDates = { ...expirationDatesOriginal };

  for (const [date, quantity] of Object.entries(expirationDatesToUpdateWith)) {
    const originalQuantity = updatedExpirationDates[date] || 0;

    if (method === 'add') {
      updatedExpirationDates[date] = originalQuantity + quantity;
    } else if (method === 'remove') {
      updatedExpirationDates[date] = Math.max(originalQuantity - quantity, 0);
      if (updatedExpirationDates[date] === 0) {
        delete updatedExpirationDates[date];
      }
    }
  }

  return updatedExpirationDates;
}
