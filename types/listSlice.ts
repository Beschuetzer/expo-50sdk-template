import {
  Item,
  StoreSpecificValues,
  LastPurchasedMap,
  StoreSpecificValueUpdater,
  Key,
} from './Item';
import { Store } from './Store';
import { SaveAllResponse } from './bffService';
import { ListNameProp } from './general';

import { ListFilterFilters } from '@/components/lists/ListFilter';
import { SortType, SortOrder } from '@/components/lists/sorters';

export enum ListName {
  InCartList = 'inCartList',
  ItemsList = 'itemsList',
  InventoryList = 'InventoryList',
  PreviouslyPurchased = 'previouslyPurchased',
  ShoppingList = 'shoppingList',
  StoresList = 'storesList',
}

export type SortOrders = {
  [key in ListName]: SortOrderValue;
};
export type SortOrderValue = { sortBy: SortType; sortOrder: SortOrder };

//#region Payloads
export type AddAllToShoppingCartPayload = Item[];

export type AddItemsListItemPayload = {
  item: Item;
  storeSpecificValues?: StoreSpecificValues;
};

export type AddStoresListItemPayload = {
  newStore: Store;
};

export type CopyStoreSpecificValuesPayload = {
  /**
   *The destination store to copy the values to
   **/
  destination: Key;

  /**
   *The source store to copy the values from
   **/
  source: Key;

  /**
   *The item to copy the values for
   * If this is given, only the store specific values for these items will be copied
   **/
  items?: [Item];
};

export type CompletePurchasePayload = LastPurchasedMap | undefined;

export type MutuallyExclusiveGroup = {
  id: string;
  itemKeys1: string[];
  itemKeys2: string[];
  name?: string;
  quantities1: number[];
  quantities2: number[];
  storeId: string;
};

export type AddMutuallyExclusiveGroupPayload = {
  itemKeys1: string[];
  itemKeys2: string[];
  name: string;
  quantities1?: number[];
  quantities2?: number[];
};

export type RemoveItemFromMutuallyExclusiveGroupPayload = {
  groupId: string;
  itemKey: string;
  side: 1 | 2;
};

export type UpdateMutuallyExclusiveGroupPayload = {
  id: string;
  itemKeys1: string[];
  itemKeys2: string[];
  name: string;
  quantities1: number[];
  quantities2: number[];
};

export type RemoveMutuallyExclusiveGroupPayload = {
  id: string;
  /** When true the group is dissolved but items remain in the shopping list */
  keepItems?: boolean;
};

export type AcceptMutuallyExclusiveGroupSidePayload = {
  id: string;
  /** 1 = keep Side A (remove Side B items), 2 = keep Side B (remove Side A items) */
  acceptedSide: 1 | 2;
};

export type AddReturnItemPayload = {
  storeId: string;
  itemKey: string;
};

export type RemoveReturnItemPayload = {
  storeId: string;
  itemKey: string;
};

/** Map of storeId → array of item keys marked as returns at that store */
export type ReturnItemsMap = { [storeId: string]: string[] };

export type HandleSaveAllResponsePayload = SaveAllResponse & {
  /**
   *The items that should have been saved
   **/
  itemsSaved: Item[];
  /**
   *The stores that should have been saved
   **/
  storesSaved: Store[];
};

export type MoveItemToAnotherCartPayload = {
  store: Store;
  item: Item;
};

export type ResetListToDisplayFiltersPayload = ListNameProp;

export type ResetListToDisplayPayload = ListNameProp;

export type SetFiltersPayload = {
  filters: ListFilterFilters<any>;
} & ListNameProp;

export type SetSortOrderPayload = object &
  ListNameProp &
  Partial<Pick<SortOrderValue, 'sortOrder' | 'sortBy'>>;

export type ToggleSortOrderPayload = Pick<SetSortOrderPayload, 'listName'>;
export type UpdateSelectedItemsPayload<T> = {
  operation: 'add' | 'remove' | 'set';
  item: T | undefined;
};
export type UpdateStoreSpecificValuesPayload = {
  /**
   *The key to get the item from {@link ItemsList itemsList}
   **/
  key: Key;
  /**
   *The new value for each store specific value
   **/
  storeSpecificValuesToUpdate: StoreSpecificValueUpdater;
  storeId?: string;
};
//#endregion
