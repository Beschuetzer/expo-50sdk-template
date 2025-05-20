import { Id, Item } from './Item';
import { GpsCoordinate } from './Store';
import { MoveInventoryItemPayload } from './inventorySlice';

export type Inventory = {
  items: InventoryItems<InventoryItem>;
  locations: InventoryLocation[];
  currentLocationId: Id['_id'] | undefined | null;
};

export type InventoryItems<T> = {
  [locationId: string]: InventoryLocationItem<T>;
};

export type InventoryLocationItem<T> = {
  [itemId: string]: T;
};

export type InventoryItem = {
  expirationDates: InventoryItemExpirationDates;
};

/**
 *The key is the timestamp and the value is the quantity with that timestamp
 **/
export type InventoryItemExpirationDates = { [time: string]: number };

export type InventoryItemWithItemDetails = InventoryItem & {
  item?: Item;
};

export type InventoryLocation = {
  description?: string;
  gpsCoordinates?: GpsCoordinate;
  name: string;
} & Id;

export type MoveInventoryItemExpirationDates = {
  expirationDates: string[];
} & Required<MoveInventoryItemPayload>;
