import { Dispatch } from '@reduxjs/toolkit';

import {
  Item,
  LastPurchasedMap,
  StoreSpecificValues,
  StoreSpecificValuesMap,
} from './Item';
import { Route, Store } from './Store';
import {
  Inventory,
  InventoryItemExpirationDates,
  MoveInventoryItemExpirationDates,
} from './inventory';
import { ItemFormOnSave } from './itemForm';
import { SortOrderValue } from './listSlice';
import { BulkWriteResult, DocumentResult } from './mongoose';

import { GenericResponse } from '@/components/services/AbstractService';
import {
  AddInventoryItemsInput,
  DeleteInventoryItemsThunkInput,
  MoveInventoryItemsThunkInput,
  SaveAllThunkInput,
} from '@/state/thunks';

//#region General Types
export type AccountInfoNeeded = Omit<UserAccount, 'email'>;
export type CredentialsNeeded = UserIdNeeded & PasswordNeeded;
export type CurrentStoreNeeded = { currentStoreId: string };
export type DispatchNeeded = {
  dispatch: Dispatch<any>;
};

export type EmailNeeded = { email: string };
/**
 *The mongodb _id for a user/item/store/etc
 **/
export type IdNeeded = { _id: string };
export type IdsNeeded = { ids: string[] };
export type ImageNeeded<T> = { image: T };
export type ItemNeeded = { item: Item };
export type ItemsNeeded = { items: Item[] };
export type LastPurchasedMapNeeded = {
  lastPurchasedMap: LastPurchasedMap;
};
export type NewPasswordNeeded = { newPassword: string };
export type ProcessedGroceryList = {
  store: string;
  items: ProcessedGroceryListItem[];
};
export type ProcessedGroceryListItem = [string, number, string];
export type StoreNeeded = { store: Store };
export type StoresNeeded = { stores: Store[] };
export type StoreSpecificValuesNeeded = {
  storeSpecificValues?: StoreSpecificValues;
};
export type StoreSpecificValuesMapNeeded = {
  storeSpecificValuesMap?: StoreSpecificValuesMap;
};
export type PasswordNeeded = { password: string };
export type StoreIdNeeded = { storeId: string };
export type RoutesNeeded = { routes: Route[] };
export type UserNeeded<T> = { user: T };
export type UserIdNeeded = { userId: string };
export type UserAccount = {
  _id: string;
  email: string;
  password: string;
};
//#endregion

//#region Input Types
export type ChangePasswordInput = CredentialsNeeded &
  DispatchNeeded &
  NewPasswordNeeded;
export type DeleteS3ObjectsInput = { objKeys: string[] } & DispatchNeeded &
  CredentialsNeeded;
export type DeleteInventoryItemsInput = {
  inventoryItems: DeleteInventoryItemsThunkInput;
} & UserAccount &
  DispatchNeeded;
export type DeleteInventoryItemsRequest = Pick<
  DeleteInventoryItemsInput,
  'inventoryItems'
> &
  UserIdNeeded &
  PasswordNeeded;
export type DeleteInventoryItemsResponse = BulkWriteResult | GenericResponse;
export type DeleteInventoryLocationInput = SaveInventoryLocationsInput;
export type DeleteInventoryLocationsRequest = SaveInventoryLocationsRequest;
export type DeleteInventoryLocationsResponse = boolean | GenericResponse;
export type DeleteItemsInput = ItemsNeeded & DispatchNeeded & CredentialsNeeded;
export type DeleteStoresInput = IdsNeeded & DispatchNeeded & CredentialsNeeded;
export type DeleteUserInput = DispatchNeeded & CredentialsNeeded;
export type GetSignedUrlInput = { filename: string } & UserIdNeeded &
  PasswordNeeded &
  DispatchNeeded;
export type GetUserItemsInput = DispatchNeeded & UserIdNeeded;
export type GetUserStoresInput = GetUserItemsInput;
export type GetStoreRoutesInput = StoreIdNeeded & DispatchNeeded;
export type LoadAllFromDbInput = DispatchNeeded & UserIdNeeded & PasswordNeeded;
export type MakeCallInput = {
  body?: string;
  errorMsg: string;
  loadingMsg: string;
  options?: RequestInit;
  path: string;
  showLoadingMsg?: boolean;
  showErrorMsg?: boolean;
  /**
   *If `true`, {@link MakeCallInput.errMsg errorMsg} will always be used.
   **/
  useErrorMessage?: boolean;
} & DispatchNeeded;
export type MoveInventoryItemExpirationDatesInput = {
  itemsToMove: ({ expirationDates: InventoryItemExpirationDates } & Omit<
    MoveInventoryItemExpirationDates,
    'expirationDates'
  >)[];
} & UserAccount &
  DispatchNeeded;
export type MoveInventoryItemExpirationDatesResponse =
  | BulkWriteResult
  | GenericResponse;
export type MoveInventoryItemExpirationDatesRequest =
  MoveInventoryItemExpirationDatesInput & UserIdNeeded & PasswordNeeded;
export type MoveInventoryItemsInput = {
  itemsToMove: MoveInventoryItemsThunkInput;
} & UserAccount &
  DispatchNeeded;
export type MoveInventoryItemsRequest = Pick<
  MoveInventoryItemsInput,
  'itemsToMove'
> &
  UserIdNeeded &
  PasswordNeeded;
export type MoveInventoryItemsResponse = BulkWriteResult | GenericResponse;
export type ProcessGroceryListInput = DispatchNeeded &
  UserIdNeeded &
  PasswordNeeded &
  ImageNeeded<string>;
export type SaveAllToDbInput = SaveAllThunkInput & DispatchNeeded & UserAccount;
export type SaveInventoryItemsInput = {
  inventoryItems: AddInventoryItemsInput;
} & DispatchNeeded &
  UserAccount;
export type SaveInventoryItemsRequest = Omit<
  SaveInventoryItemsInput,
  'dispatch'
> &
  UserIdNeeded &
  PasswordNeeded;
export type SaveInventoryItemsResponse = BulkWriteResult | GenericResponse;
export type SaveInventoryLocationsInput = Pick<Inventory, 'locations'> &
  DispatchNeeded &
  UserAccount;
export type SaveInventoryLocationsRequest = Omit<
  SaveInventoryLocationsInput,
  'dispatch'
> &
  UserIdNeeded &
  PasswordNeeded;
export type SaveInventoryLocationsResponse = BulkWriteResult | GenericResponse;
export type SaveItemInput = DispatchNeeded & UserAccount & ItemFormOnSave;
export type SaveItemRequest = Omit<
  SaveItemInput,
  'dispatch' | 'storeSpecificValues'
> &
  StoreSpecificValuesMapNeeded &
  UserIdNeeded &
  PasswordNeeded;
export type SaveItemsInput = ItemsNeeded &
  StoreSpecificValuesMapNeeded &
  DispatchNeeded &
  Omit<UserAccount, 'email'>;
export type SaveItemsRequest = Omit<SaveItemsInput, 'dispatch'> &
  StoreSpecificValuesMapNeeded &
  UserIdNeeded &
  PasswordNeeded;
export type SaveStoreInput = StoreNeeded & DispatchNeeded & CredentialsNeeded;
export type SaveStoreRoutesInput = StoreIdNeeded &
  RoutesNeeded &
  DispatchNeeded &
  CredentialsNeeded;
export type SaveStoreRoutesRequest = Omit<SaveStoreRoutesInput, 'dispatch'> &
  UserIdNeeded &
  PasswordNeeded;
export type DeleteStoreRoutesInput = StoreIdNeeded &
  IdsNeeded &
  DispatchNeeded &
  CredentialsNeeded;
export type DeleteStoreRoutesRequest = Omit<
  DeleteStoreRoutesInput,
  'dispatch'
> &
  UserIdNeeded &
  PasswordNeeded;
/**
 *For persisting just the storeSpecificValuesMap document instead of
 *saving/updating any items.
 **/
export type SaveStoreSpecificValuesInput = {
  storeSpecificValuesMap: StoreSpecificValuesMap;
} & DispatchNeeded &
  UserAccount;
export type SaveStoreSpecificValuesRequest = Omit<
  SaveStoreSpecificValuesInput,
  'dispatch'
> &
  UserIdNeeded &
  PasswordNeeded;
export type SavePurchaseInput = LastPurchasedMapNeeded &
  DispatchNeeded &
  CredentialsNeeded;
export type SavePurchaseRequest = Omit<SavePurchaseInput, 'dispatch'> &
  UserIdNeeded &
  PasswordNeeded;
export type SaveStoreRequest = Omit<SaveStoreInput, 'dispatch'> &
  UserIdNeeded &
  PasswordNeeded;
export type UpdateStoreInput = SaveStoreInput;
export type UpdateUserInput = DispatchNeeded & CredentialsNeeded;
export type UserAccountInput = Omit<UserAccount, '_id'>;
//#endregion

//#region Response Types
export type ChangePasswordResponse = { success: boolean } | GenericResponse;
export type CreateUserResponse = UserAccount | GenericResponse;
export type DeleteS3ObjectsResponse = boolean | GenericResponse;
export type DeletionResponse =
  | {
      acknowledged: boolean;
      deletedCount: number;
    }
  | GenericResponse;
export type DeleteUserResponse =
  | {
      deletedUser: UserAccount;
      deletedItems: DeletionResponse;
      deletedLastPurchasedMap: DeletionResponse;
      deletedStores: DeletionResponse;
      deletedStoreSpecificItems: DeletionResponse;
    }
  | GenericResponse;
export type LoadAllResponse =
  | {
      inventory: Inventory;
      items: Item[];
      stores: Store[];
      storeSpecificValues: StoreSpecificValuesMap;
      lastPurchasedMap: LastPurchasedMap;
      settings: CurrentStoreNeeded & {
        sortOrderValues: {
          items: SortOrderValue;
          stores: SortOrderValue;
        };
      };
    }
  | GenericResponse;
export type LoginResponse = UserAccount | GenericResponse;
export type PingResponse = { isAwake: boolean } | GenericResponse;
export type ProcessGroceryListResponse = ProcessedGroceryList | GenericResponse;
export type SaveAllResponse =
  | {
      itemsResult: BulkWriteResult;
      lastPurchasedMapResult: DocumentResult<LastPurchasedMap>;
      storesResult: BulkWriteResult;
      storeSpecificValuesResult: DocumentResult<StoreSpecificValuesMap>;
    }
  | GenericResponse;
export type SaveItemResponse = Item | GenericResponse;
export type SavePurchaseResponse = IdNeeded | GenericResponse;
export type SaveStoreResponse = Store | GenericResponse;
export type SaveStoreRoutesResponse = Route[] | GenericResponse;
export type GetStoreRoutesResponse = Route[] | GenericResponse;
export type DeleteStoreRoutesResponse = Route[] | GenericResponse;
export type SaveStoreSpecificValuesResponse =
  | DocumentResult<StoreSpecificValuesMap>
  | GenericResponse;
export type SignedUrlResponse =
  | { downloadUrl: string; uploadUrl: string }
  | GenericResponse;
//#endregion
