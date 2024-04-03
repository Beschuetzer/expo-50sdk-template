import { getImagesFromUpcProduct } from './helpers';

import {
  DEFAULT_IMAGE_INDEX,
  EMPTY_NUMBER,
  EMPTY_STRING,
  IMAGE_PRIORITY_MAPPING,
  UNIT_INITIAL,
} from '@/constants/general';
import { UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs';
import {
  Item,
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { UpcProduct } from '@/types/UpcResponse';

export function getItem(input?: UpcProduct | null): Item {
  return {
    frequency: EMPTY_NUMBER,
    images: getImagesFromUpcProduct(input) || [],
    imageToUseIndex: DEFAULT_IMAGE_INDEX,
    name:
      input?.brands && input?.product_name
        ? `${input.brands} - ${input?.product_name}`
        : input?.product_name || EMPTY_STRING,
    upc:
      input?.code?.length === UPC_REQUIRED_CHAR_LENGTH + 1
        ? input.code.substring(1)
        : input?.code || input?.id || EMPTY_STRING,
    unit: UNIT_INITIAL,
    addedDate: 0,
    lastUpdatedDate: 0,
  };
}

export function getItemWithStoreSpecificValues(
  item: Item,
  storeSpecificValues: StoreSpecificValues,
): ItemWithStoreSpecificValues {
  return {
    ...item,
    [StoreSpecificValueKey.AisleNumber]:
      storeSpecificValues?.[StoreSpecificValueKey.AisleNumber] || {},
    [StoreSpecificValueKey.IsInCart]:
      storeSpecificValues?.[StoreSpecificValueKey.IsInCart] || {},
    [StoreSpecificValueKey.ItemId]:
      storeSpecificValues?.[StoreSpecificValueKey.ItemId] || {},
    [StoreSpecificValueKey.Price]:
      storeSpecificValues?.[StoreSpecificValueKey.Price] || {},
    [StoreSpecificValueKey.Quantity]:
      storeSpecificValues?.[StoreSpecificValueKey.Quantity] || {},
  };
}

export function getUpcProduct(item: Item, addLeadingZero = true): UpcProduct {
  const toReturn = {
    product_name: item.name || EMPTY_STRING,
    code: (addLeadingZero ? `0${item.upc}` : item.upc) || EMPTY_STRING,
    id: (addLeadingZero ? `0${item.upc}` : item.upc) || EMPTY_STRING,
  } as UpcProduct;

  let keyNumber = 0;
  for (const image of item?.images || []) {
    const nextKey = IMAGE_PRIORITY_MAPPING?.[keyNumber];
    if (nextKey) {
      toReturn[nextKey as keyof UpcProduct] = image;
      keyNumber++;
    } else {
      break;
    }
  }
  return toReturn;
}
