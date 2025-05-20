import { MOCK_STORES } from './mockStores';

import {
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
  ITEM_UNIT_INITIAL,
  WEEK_IN_MS,
} from '@/constants/general';
import { UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs';
import {
  Item,
  ItemUnit,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { TimeSpan } from '@/types/general';
import { getId } from '@/utils/helpers';

const MOCK_NAMES = [
  'Apple',
  'Bannana',
  'Cake',
  'Candy',
  'Carrot',
  'Chicken',
  'Chocolate',
  'Duck',
  'Turkey',
];

const MOCK_IMAGES = [
  'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg',
  'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.200.jpg',
  'https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.100.jpg',
  'https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.200.jpg',
  'https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.400.jpg',
  'https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.100.jpg',
  'https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.100.jpg',
  'https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.100.jpg',
  'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.200.jpg',
  'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg',
  'https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.200.jpg',
  'https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.200.jpg',
  'https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg',
];

export function getRandomEnumValue<T>(enumeration: any): T {
  const values = Object.values(enumeration) as T[];
  const randomIndex = Math.floor(Math.random() * values.length);
  return (values as any)[randomIndex] as T;
}

export function getRandomInt(min: number, max: number) {
  if (min > max) {
    throw new Error('Min must be less than or equal to max');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomStoreSpecificValues(
  storesNamesToPickFrom = MOCK_STORES.map((store) => store.name),
): StoreSpecificValues {
  const numberOfItemsToAdd = getRandomInt(
    1,
    Math.max(1, Math.ceil((storesNamesToPickFrom.length - 1) / 2)),
  );

  const numbersAlreadyUsed = new Set<number>();
  let toReturn = {} as StoreSpecificValues;
  for (let i = 0; i < numberOfItemsToAdd; i++) {
    const availableIndices = Array.from(
      { length: storesNamesToPickFrom.length },
      (_, i) => i,
    ).filter((index) => !numbersAlreadyUsed.has(index));

    if (availableIndices.length === 0) {
      break;
    }

    const randomIndex =
      availableIndices[getRandomInt(0, availableIndices.length - 1)];

    if (storesNamesToPickFrom?.[randomIndex] == null) {
      continue;
    }

    numbersAlreadyUsed.add(randomIndex);
    toReturn = {
      [StoreSpecificValueKey.ItemId]: {
        ...toReturn?.[StoreSpecificValueKey.ItemId],
        [storesNamesToPickFrom[randomIndex]]:
          `${getRandomInt(0, 1000000).toString().padStart(10, '0')}`,
      },
      [StoreSpecificValueKey.AisleNumber]: {
        ...toReturn?.[StoreSpecificValueKey.AisleNumber],
        [storesNamesToPickFrom[randomIndex]]: getRandomInt(0, 2000).toString(),
      },
      [StoreSpecificValueKey.Price]: {
        ...toReturn?.[StoreSpecificValueKey.Price],
        [storesNamesToPickFrom[randomIndex]]: getRandomInt(1, 1000),
      },
      [StoreSpecificValueKey.IsInCart]: {
        ...toReturn?.[StoreSpecificValueKey.IsInCart],
        [storesNamesToPickFrom[randomIndex]]: false,
      },
      [StoreSpecificValueKey.Quantity]: {},
    };
  }

  return toReturn;
}

export function getRandomItem(lastUpcNumber: number | string): Item {
  const upcToUse = lastUpcNumber
    .toString()
    .padStart(UPC_REQUIRED_CHAR_LENGTH, '0');

  return {
    _id: getId(),
    addedDate: Date.now() - getRandomInt(0, WEEK_IN_MS * 52),
    lastUpdatedDate: Date.now(),
    frequency:
      TIME_SPAN_TO_MILLISECONDS_MAPPING[
        getRandomEnumValue<TimeSpan>(TimeSpan)
      ] * getRandomInt(1, 10),
    imageToUseIndex: 0,
    images: Array(getRandomInt(1, 3)).fill(
      MOCK_IMAGES[getRandomInt(0, MOCK_IMAGES.length - 1)],
    ),
    name: `${MOCK_NAMES[getRandomInt(0, MOCK_NAMES.length - 1)]}-${Math.random()}`,
    unit: Object.values(ItemUnit || {}).find((item) => {
      let randomValue = getRandomEnumValue<ItemUnit>(ItemUnit);
      if (randomValue === ItemUnit.Custom) randomValue = ITEM_UNIT_INITIAL;
      return item === randomValue;
    }) as any,
    upc: upcToUse,
    inventoryMinimum: getRandomInt(0, 4),
    isFrozen: getRandomInt(0, 1) === 1,
    timeToExpiration: 1000 * 60 * 60 * 24 * getRandomInt(1, 100),
  };
}
