import {
  Item,
  StoreSpecificValues,
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';

export function getItemWithStoreSpecificValues(
  item: Item,
  storeSpecificValues: StoreSpecificValues,
): ItemWithStoreSpecificValues {
  const DEFAULTS = {
    [StoreSpecificValueKey.AisleNumber]:
      storeSpecificValues?.[StoreSpecificValueKey.AisleNumber] || {},
    [StoreSpecificValueKey.IsInCart]:
      storeSpecificValues?.[StoreSpecificValueKey.IsInCart] || {},
    [StoreSpecificValueKey.ItemId]:
      storeSpecificValues?.[StoreSpecificValueKey.ItemId] || {},
    [StoreSpecificValueKey.Location]:
      storeSpecificValues?.[StoreSpecificValueKey.Location] || {},
    [StoreSpecificValueKey.Note]:
      storeSpecificValues?.[StoreSpecificValueKey.Note] || {},
    [StoreSpecificValueKey.Price]:
      storeSpecificValues?.[StoreSpecificValueKey.Price] || {},
    [StoreSpecificValueKey.Quantity]:
      storeSpecificValues?.[StoreSpecificValueKey.Quantity] || {},
  };
  return {
    ...item,
    ...DEFAULTS,
  };
}
