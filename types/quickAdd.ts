import { Item, ItemsList, StoreSpecificValuesMap } from './Item';
import { Store } from './Store';
import { ProcessedGroceryList } from './bffService';
import { ArrayElement } from './helpers';
import { ItemFormOnSave } from './itemForm';

import { ItemSearchModalSelectedItem } from '@/components/modals/ItemSearchModal';

export type ProcessedGroceryListWithGuesses = {
  guesses: QuickAddGuesses;
} & ProcessedGroceryList;

export type QuickAddGuesses = Record<string, [Item, number][]>;
export type QuickAddMode = 'append' | 'replace';
export type QuickAddNewItems = { [key: string]: ItemFormOnSave | undefined };
export type QuickAddRowProps = {
  currentStore: Store;
  guesses: QuickAddGuesses[string];
  item: ArrayElement<ProcessedGroceryList['items']>;
  itemsList: ItemsList;
  storeSpecificValuesMap: StoreSpecificValuesMap;
  index: number;
  previouslySelectedIndex?: number;
  onAddNewItem?: (parsedName: string, newItemPayload?: ItemFormOnSave) => void;
  onQuantityChange: (parsedName: string, quantity: number) => void;
  onSearchModalSelect: (
    parsedName: string,
    item: ItemSearchModalSelectedItem<Item>,
  ) => void;
  onSearchPress?: (item: QuickAddRowProps['item']) => void;
  onSelectItem: (parsedName: string, selectedIndex: number, item: Item) => void;
};

export type QuickAddState = {
  quickAddList: ProcessedGroceryList;
  mode: QuickAddMode;
};

export type SelectedItemIdsAndQuantities = {
  [key: string]: {
    quantity: number;
    id: string;
  };
};
