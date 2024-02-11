import { getImagesFromUpcProduct } from './helpers'

import {
  DEFAULT_IMAGE_INDEX,
  EMPTY_NUMBER,
  EMPTY_STRING,
  IMAGE_PRIORITY_MAPPING,
} from '@/constants/general'
import { Item } from '@/types/Item'
import { UpcProduct } from '@/types/UpcResponse'

export function getItem(input: UpcProduct): Item {
  return {
    frequency: EMPTY_NUMBER,
    images: getImagesFromUpcProduct(input),
    imageToUseIndex: DEFAULT_IMAGE_INDEX,
    name: input?.product_name || EMPTY_STRING,
    upc: input?.code || input?.id || EMPTY_STRING,
  }
}

export function getUpcProduct(item: Item, addLeadingZero = true): UpcProduct {
  const toReturn = {
    product_name: item.name || EMPTY_STRING,
    code: (addLeadingZero ? `0${item.upc}` : item.upc) || EMPTY_STRING,
    id: (addLeadingZero ? `0${item.upc}` : item.upc) || EMPTY_STRING,
  } as UpcProduct

  let keyNumber = 0
  for (const image of item?.images || []) {
    const nextKey = IMAGE_PRIORITY_MAPPING?.[keyNumber]
    if (nextKey) {
      toReturn[nextKey as keyof UpcProduct] = image
      keyNumber++
    } else {
      break
    }
  }
  return toReturn
}
