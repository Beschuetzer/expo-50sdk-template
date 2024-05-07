import { getImagesFromUpcProduct, getStandardizedUpcValue } from './helpers';

import {
  DEFAULT_IMAGE_INDEX,
  EMPTY_NUMBER,
  EMPTY_STRING,
  IMAGE_PRIORITY_MAPPING,
  NAME_ORDER_BRANDS_STRING,
  NAME_ORDER_PRODUCT_NAME_STRING,
  NAME_ORDER_TEMPLATE_INITIAL,
  UNIT_INITIAL,
} from '@/constants/general';
import {
  Item,
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { UpcProduct } from '@/types/UpcResponse';

type GetItemParams = {
  upcProduct?: UpcProduct | null;
  nameOrderTemplate?: string;
};
export function getItem(input: GetItemParams): Item {
  const { upcProduct, nameOrderTemplate } = input;
  return {
    frequency: EMPTY_NUMBER,
    images: getImagesFromUpcProduct(upcProduct) || [],
    imageToUseIndex: DEFAULT_IMAGE_INDEX,
    name:
      upcProduct?.brands && upcProduct?.product_name
        ? getItemName({ upcProduct, nameOrderTemplate })
        : upcProduct?.product_name || EMPTY_STRING,
    upc:
      getStandardizedUpcValue(upcProduct?.code) ||
      upcProduct?.id ||
      EMPTY_STRING,
    unit: UNIT_INITIAL,
    addedDate: 0,
    lastUpdatedDate: 0,
  };
}

export function getItemName(input: GetItemParams): string {
  const { upcProduct, nameOrderTemplate = NAME_ORDER_TEMPLATE_INITIAL } = input;
  const replaced = nameOrderTemplate
    ?.replaceAll(
      NAME_ORDER_PRODUCT_NAME_STRING,
      upcProduct?.[NAME_ORDER_PRODUCT_NAME_STRING] || EMPTY_STRING,
    )
    ?.replaceAll(
      NAME_ORDER_BRANDS_STRING,
      upcProduct?.[NAME_ORDER_BRANDS_STRING] || EMPTY_STRING,
    );
  return replaced;
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
