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

export type CompletePurchasePayload = LastPurchasedMap | undefined;

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
