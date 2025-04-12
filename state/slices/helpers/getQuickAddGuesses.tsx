import { token_set_ratio } from 'fuzzball';
import { stringSimilarity } from 'string-similarity-js';

import { EMPTY_STRING } from '@/constants/general';
import { Item } from '@/types/Item';
import { ProcessedGroceryList } from '@/types/bffService';
import { QuickAddGuesses } from '@/types/quickAdd';

const ITEM_WEIGHT_INDEX = 1;
export function getQuickAddGuesses(
  items: Item[],
  quickAddList: ProcessedGroceryList,
) {
  const guesses = {} as QuickAddGuesses;

  for (const itemsListItem of items) {
    const itemsListItemName = itemsListItem.name;

    if (!itemsListItemName) continue;

    for (let index = 0; index < quickAddList.items.length; index++) {
      const quickAddItem = quickAddList?.items?.[index];
      const quickAddItemFullname = quickAddItem?.[0] || EMPTY_STRING;
      const similarity = stringSimilarity(
        itemsListItemName,
        quickAddItem[0],
        Math.ceil(quickAddItem[0].length / 2),
      );

      if (!guesses[quickAddItemFullname]) {
        guesses[quickAddItemFullname] = [];
      }

      if (similarity > 0.05) {
        const weightedScore = token_set_ratio(
          itemsListItemName,
          quickAddItem[0],
        );

        if (weightedScore > 50) {
          guesses[quickAddItemFullname].push([
            itemsListItem,
            Math.round(weightedScore * similarity),
          ]);
        }
      }
    }
  }

  //removing anything below 100 if 100 is present (exact match)
  for (const [parsedValue, array] of Object.entries({ ...guesses })) {
    const newArray = array.sort((a, b) => {
      const firstWeight = a[ITEM_WEIGHT_INDEX];
      const secondWeight = b[ITEM_WEIGHT_INDEX];
      if (secondWeight === firstWeight) return 0;
      return secondWeight > firstWeight ? 1 : -1;
    });

    let hasExactMatch = false;
    for (const arrElement of array) {
      if (arrElement[ITEM_WEIGHT_INDEX] === 100) {
        hasExactMatch = true;
        break;
      }
    }

    //set sorted array if no exact match otherwise return just exact matches
    if (!hasExactMatch) {
      guesses[parsedValue] = newArray;
      continue;
    }

    const filtered = newArray.filter((item) => item[ITEM_WEIGHT_INDEX] === 100);
    guesses[parsedValue] = filtered;
  }

  return guesses;
}
