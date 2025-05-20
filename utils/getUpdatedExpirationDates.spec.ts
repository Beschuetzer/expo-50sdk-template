import { getUpdatedExpirationDates } from './getUpdatedExpirationDates';

import { InventoryItemExpirationDates } from '@/types/inventory';

describe('getUpdatedExpirationDates', () => {
  // Use Date.parse for all keys.
  const date1 = Date.parse('2023-10-01');
  const date2 = Date.parse('2023-10-02');
  const date3 = Date.parse('2023-10-03');

  it('should add quantities to existing expiration dates', () => {
    const original: InventoryItemExpirationDates = {
      [date1]: 5,
      [date2]: 3,
    };
    const toUpdateWith: InventoryItemExpirationDates = {
      [date1]: 2,
      [date3]: 4,
    };
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'add');
    expect(result).toEqual({
      [date1]: 7,
      [date2]: 3,
      [date3]: 4,
    });
  });

  it('should remove quantities from existing expiration dates', () => {
    const original: InventoryItemExpirationDates = {
      [date1]: 5,
      [date2]: 3,
    };
    const toUpdateWith: InventoryItemExpirationDates = {
      [date1]: 2,
      [date2]: 3,
    };
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'remove');
    // Since removal happens in order (sorted ascending by key),
    // it will remove 2 from date1 (leaving 3) and then attempt to remove from date2.
    // In this case, because exactly 3 is removed from date2,
    // our implementation might either remove the key if the result is zero or keep it.
    // Based on the provided test expectation we keep only the updated key if quantity > 0.
    // Here, date2 would become 0 so we expect only date1 with a value of 3.
    expect(result).toEqual({ [date1]: 3 });
  });

  it('should delete an expiration date if quantity becomes zero after removal', () => {
    const original: InventoryItemExpirationDates = { [date1]: 5 };
    const toUpdateWith: InventoryItemExpirationDates = { [date1]: 5 };
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'remove');
    expect(result).toEqual({});
  });

  it('should return the original expiration dates if no updates are provided', () => {
    const original: InventoryItemExpirationDates = { [date1]: 5 };
    const toUpdateWith: InventoryItemExpirationDates = {};
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'add');
    expect(result).toEqual(original);
  });

  it('should handle undefined original expiration dates gracefully', () => {
    const original: InventoryItemExpirationDates = undefined as any;
    const toUpdateWith: InventoryItemExpirationDates = { [date1]: 5 };
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'add');
    expect(result).toBeUndefined();
  });

  it('should handle undefined update expiration dates gracefully', () => {
    const original: InventoryItemExpirationDates = { [date1]: 5 };
    const toUpdateWith: InventoryItemExpirationDates = undefined as any;
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'add');
    expect(result).toEqual(original);
  });

  it('should handle invalid method gracefully', () => {
    const original: InventoryItemExpirationDates = { [date1]: 5 };
    const toUpdateWith: InventoryItemExpirationDates = { [date1]: 2 };
    const result = getUpdatedExpirationDates(
      original,
      toUpdateWith,
      'invalid' as any,
    );
    expect(result).toEqual(original);
  });

  it('should not allow negative quantities after removal', () => {
    const original: InventoryItemExpirationDates = { [date1]: 5 };
    const toUpdateWith: InventoryItemExpirationDates = { [date1]: 10 };
    const result = getUpdatedExpirationDates(original, toUpdateWith, 'remove');
    expect(result).toEqual({});
  });
});
