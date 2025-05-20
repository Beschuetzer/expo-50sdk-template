import { Item } from './Item';
import {
  Inventory,
  InventoryItem,
  InventoryItemWithItemDetails,
} from './inventory';

import { CompletePurchaseModalItemToLocationMap } from '@/components/modals/CompletePurchaseModal';

export type InventorySliceState = Inventory & {
  lastDecrementedItemId: string;
};

export type AddItemPayload = {
  itemId: string;
  locationId: string;
  name: string;
  quantity: number;
};

export type InsertInventoryItemPayload = {
  /**
   * * The ID of the location where the item is being inserted.
   * If not provided, the item will be inserted into the current location.
   **/
  locationId?: string;
  item: InventoryItem;
  itemId: string;
};

export type ProcessItemToLocationMap = {
  itemToLocationMap: CompletePurchaseModalItemToLocationMap;
};

export type RemoveInventoryItemPayload = Omit<
  InsertInventoryItemPayload,
  'item'
> &
  InventoryItem;

export type InventoryItemSelectorProps = {
  itemId: string;
  locationId?: string;
};

export type InventoryItemSelectorResponse = {
  inventoryItem?: InventoryItemWithItemDetails;
  item?: Item;
};

export type MoveInventoryItemPayload = {
  itemId: string;

  /**
   *@default currentInventoryLocationId
   **/
  originLocationId?: string;
  targetLocationId: string;
};
