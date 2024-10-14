import { Dispatch, UnknownAction } from '@reduxjs/toolkit';

import { AbstractService, GenericResponse } from './AbstractService';
import { ItemFormOnSave } from '../forms/ItemForm';

import { EMPTY_STRING, ITEM_UNIT_INITIAL } from '@/constants/general';
import { setError } from '@/state/slices/generalSlice';
import { SortOrderValue } from '@/state/slices/listsSlice';
import { SaveAllThunkInput } from '@/state/thunks';
import {
  Item,
  LastPurchasedMap,
  StoreSpecificValues,
  StoreSpecificValuesMap,
} from '@/types/Item';
import { Store } from '@/types/Store';
import { BulkWriteResult, DocumentResult } from '@/types/mongoose';
import {
  getIsDevelopmentMode,
  getKeyToUse,
  handleError,
} from '@/utils/helpers';

function displayAlert(object: object | null) {
  alert(object ? JSON.stringify(object, null, 2) : object);
}

/**
 *This is assuming that a phone is being used and not an emulator.
 *Use ipconfig to manually set this atm. (write node script to run when npm start is run?)
 **/
export const BACKEND_URL = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:${process.env.EXPO_PUBLIC_PORT_NUMBER}`;
export const ITEM_PATH = '/item';
export const LAST_PURCHASED_PATH = '/lastPurchasedMap';
export const STORE_PATH = '/store';
export const USER_PATH = '/user';

export const DELETE_ITEMS_RESPONSE_DEFAULT: DeletionResponse = Object.freeze({
  acknowledged: false,
  deletedCount: 0,
});

//#region General Types
export type AccountInfoNeeded = Omit<UserAccount, 'email'>;
export type CredentialsNeeded = UserIdNeeded & PasswordNeeded;
export type CurrentStoreNeeded = { currentStoreId: string };
export type DispatchNeeded = {
  dispatch: Dispatch<UnknownAction>;
};

export type EmailNeeded = { email: string };
/**
 *The mongodb _id for a user/item/store/etc
 **/
export type IdNeeded = { _id: string };
export type IdsNeeded = { ids: string[] };
export type ItemNeeded = { item: Item };
export type ItemsNeeded = { items: Item[] };
export type LastPurchasedMapNeeded = {
  lastPurchasedMap: LastPurchasedMap;
};
export type StoreNeeded = { store: Store };
export type StoresNeeded = { stores: Store[] };
export type StoreSpecificValuesNeeded = {
  storeSpecificValues?: StoreSpecificValues;
};
export type StoreSpecificValuesMapNeeded = {
  storeSpecificValuesMap?: StoreSpecificValuesMap;
};
export type PasswordNeeded = { password: string };
export type UserNeeded<T> = { user: T };
export type UserIdNeeded = { userId: string };
export type UserAccount = {
  _id: string;
  email: string;
  password: string;
};
//#endregion

//#region Input Types
export type DeleteItemsInput = ItemsNeeded & DispatchNeeded & CredentialsNeeded;
export type DeleteStoresInput = IdsNeeded & DispatchNeeded & CredentialsNeeded;
export type DeleteUserInput = DispatchNeeded & CredentialsNeeded;
export type GetUserItemsInput = DispatchNeeded & UserIdNeeded;
export type GetUserStoresInput = GetUserItemsInput;
export type LoadAllFromDbInput = DispatchNeeded & UserIdNeeded & PasswordNeeded;
export type MakeCallInput = {
  body?: string;
  errorMsg: string;
  loadingMsg: string;
  options?: RequestInit;
  path: string;
  /**
   *If `true`, {@link MakeCallInput.errMsg errorMsg} will always be used.
   **/
  useErrorMessage?: boolean;
} & DispatchNeeded;
export type SaveAllToDbInput = SaveAllThunkInput & DispatchNeeded & UserAccount;
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
export type CreateUserResponse = UserAccount | GenericResponse;
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
//#endregion

class BffService extends AbstractService {
  constructor() {
    super(
      getIsDevelopmentMode()
        ? BACKEND_URL
        : 'https://grocify-bff-ac27c2662495.herokuapp.com',
    );
    displayAlert({
      bffServiceBaseUrl: this._baseUrl,
      EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
    });
  }

  async createUser(input: UserNeeded<UserAccountInput> & DispatchNeeded) {
    const { user, dispatch } = input || {};
    if (!user) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No user account given in createUser()',
        }),
      );
      return;
    }
    const body = JSON.stringify(user);
    const response = await this.makeCall<CreateUserResponse>({
      dispatch,
      body,
      options: {
        method: 'POST',
      },
      path: USER_PATH,
      errorMsg: `Unable to create user with email of '${user.email}'`,
      loadingMsg: `Creating user with email of '${user.email}'...`,
    });
    return response;
  }

  async checkIsEmailAvailable(input: EmailNeeded & DispatchNeeded) {
    const { email, dispatch } = input || {};
    if (!email) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No email given in checkIsEmailAvailable',
        }),
      );
      return;
    }
    const isEmailAvailable = await this.makeCall<boolean>({
      dispatch,
      path: `${USER_PATH}/isEmailAvailable/${email}`,
      errorMsg: `Unable to verify whether '${email}' is available.`,
      loadingMsg: `Checking if '${email}' is available...`,
    });
    return isEmailAvailable;
  }

  async deleteItems(input: DeleteItemsInput) {
    const { items, dispatch, userId, password } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) {
      return DELETE_ITEMS_RESPONSE_DEFAULT;
    }

    const ids = items.map((item) => item?._id || EMPTY_STRING);
    const idsString = ids.join(', ');
    const keys = items.map((item) => getKeyToUse(item));
    const response = await this.makeCall<DeletionResponse>({
      path: `${ITEM_PATH}`,
      body: JSON.stringify({ userId, password, ids, keys }),
      options: {
        method: 'DELETE',
      },
      dispatch,
      errorMsg: `Unable to delete ${idsString}`,
      loadingMsg: `Deleting ${idsString}...`,
    });
    return response;
  }

  async deleteStores(input: DeleteStoresInput) {
    const { ids, dispatch, userId, password } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) {
      return DELETE_ITEMS_RESPONSE_DEFAULT;
    }

    const idsString = ids.join(', ');
    const response = await this.makeCall<DeletionResponse>({
      path: `${STORE_PATH}`,
      body: JSON.stringify({ userId, password, ids }),
      options: {
        method: 'DELETE',
      },
      dispatch,
      errorMsg: `Unable to delete ${idsString}`,
      loadingMsg: `Deleting ${idsString}...`,
    });
    return response;
  }

  async deleteUser(input: DeleteUserInput) {
    const { dispatch, userId, password } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) return;
    const body = JSON.stringify({ userId, password });
    const response = await this.makeCall<DeleteUserResponse>({
      body,
      options: {
        method: 'DELETE',
      },
      path: `${USER_PATH}`,
      dispatch,
      errorMsg: `Unable to delete user with id of '${userId}'`,
      loadingMsg: `Deleting user with id of '${userId}'...`,
    });
    return response;
  }

  async getStore(input: IdNeeded & DispatchNeeded) {
    const { _id, dispatch } = input || {};
    if (!_id) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No user account given in getStore()',
        }),
      );
      return;
    }
    const response = await this.makeCall({
      path: `${STORE_PATH}/${_id}`,
      dispatch,
      errorMsg: `Unable to get store with id of '${_id}'`,
      loadingMsg: `Getting store with id of '${_id}'...`,
    });
    return response;
  }

  async getUser(input: IdNeeded & DispatchNeeded) {
    const { _id, dispatch } = input || {};
    if (!_id) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No user account given in getUser()',
        }),
      );
      return;
    }
    const response = await this.makeCall({
      path: `${USER_PATH}/${_id}`,
      dispatch,
      errorMsg: `Unable to get user with id of '${_id}'`,
      loadingMsg: `Getting user with id of '${_id}'...`,
    });
    return response;
  }

  async getUserItems(input: GetUserItemsInput) {
    const { dispatch, userId } = input || {};
    const response = await this.makeCall<Item[]>({
      path: `${ITEM_PATH}${USER_PATH}/${userId}`,
      dispatch,
      errorMsg: `Unable to get items for user with id of '${userId}'`,
      loadingMsg: `Getting items for user with id of '${userId}'...`,
    });
    return response;
  }

  async getUserStores(input: GetUserStoresInput) {
    const { dispatch, userId } = input || {};

    const response = await this.makeCall<Store[]>({
      path: `${ITEM_PATH}${USER_PATH}/${userId}`,
      dispatch,
      errorMsg: `Unable to get stores for user with id of '${userId}'`,
      loadingMsg: `Getting stores for user with id of '${userId}'...`,
    });
    return response;
  }

  async login(input: UserNeeded<UserAccountInput> & DispatchNeeded) {
    const { user, dispatch } = input || {};
    if (!user) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No user given in checkIsPasswordCorrect',
        }),
      );
      return;
    }
    const body = JSON.stringify({ ...user });
    const userAccount = await this.makeCall<LoginResponse>({
      dispatch,
      body,
      options: {
        method: 'POST',
      },
      path: `${USER_PATH}/login`,
      errorMsg: `Unable to login.  Please check your password.`,
      loadingMsg: `Logging in as '${user.email}'`,
      useErrorMessage: true,
    });
    return userAccount;
  }

  async loadAllFromDb(input: LoadAllFromDbInput) {
    const { dispatch, userId, password } = input;
    if (!this.validateCredentials(userId, password, dispatch)) return;
    const body = JSON.stringify({
      userId,
      password,
    });

    const response = await this.makeCall<LoadAllResponse>({
      options: {
        method: 'POST',
      },
      dispatch,
      body,
      path: `${USER_PATH}/loadAll`,
      errorMsg: `Unable to load data from the cloud.`,
      loadingMsg: `Loading data from the cloud...`,
    });
    return response;
  }

  async saveAllToDb(input: SaveAllToDbInput) {
    const { dispatch, _id: userId, password, email, ...rest } = input;
    if (!this.validateCredentials(userId, password, dispatch)) return;

    if (!rest.items) {
      handleError(dispatch, {
        statusCode: 500,
        message: 'No items given in saveAllToDb()',
      });
      return null;
    }

    const standardizedItems = rest.items.data.map((item) =>
      this.getStandardizedItem(item),
    );

    const standardizedStores = rest.stores.data.map((store) =>
      this.getStandardizedStore(store),
    );

    const body = JSON.stringify({
      ...rest,
      items: {
        ...rest.items,
        data: standardizedItems,
      },
      stores: {
        ...rest.stores,
        data: standardizedStores,
      },
      userId,
      password,
    } as SaveAllThunkInput);

    const response = await this.makeCall<SaveAllResponse>({
      options: {
        method: 'POST',
      },
      dispatch,
      body,
      path: `${USER_PATH}/saveAll`,
      errorMsg: `Unable to save data to the cloud.`,
      loadingMsg: `Backing up data to the cloud...`,
    });
    return response;
  }

  async saveItem(input: SaveItemInput) {
    const {
      dispatch,
      storeSpecificValues,
      _id: userId,
      item,
      hasKeyChanged,
      originalKey,
      password,
    } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) return;

    if (!item) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No item given in saveItem()',
        }),
      );
      return null;
    }
    console.log({ originalKey });

    const body = JSON.stringify({
      item: this.getStandardizedItem(item),
      storeSpecificValuesMap: {
        [getKeyToUse(item)]: storeSpecificValues,
      },
      userId,
      password,
      originalKey: hasKeyChanged ? originalKey : undefined,
    } as SaveItemRequest);

    return await this.makeCall<SaveItemResponse>({
      dispatch,
      body,
      path: ITEM_PATH,
      errorMsg: `Unable to create item`,
      loadingMsg: `Saving item...`,
      options: {
        method: 'POST',
      },
    });
  }

  async saveItems(input: SaveItemsInput) {
    const {
      dispatch,
      storeSpecificValuesMap,
      items,
      _id: userId,
      password,
    } = input;
    if (!this.validateCredentials(userId, password, dispatch)) return;

    if (!items || items.length <= 0) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No items given in saveItems()',
        }),
      );
      return;
    }

    items.map((item) => this.getStandardizedItem(item));

    const body = JSON.stringify({
      items,
      storeSpecificValuesMap,
      userId,
      password,
    } as SaveItemsRequest);

    const response = await this.makeCall<Item>({
      options: {
        method: 'POST',
      },
      dispatch,
      body,
      path: `${ITEM_PATH}/many`,
      errorMsg: `Unable to create items`,
      loadingMsg: `Saving items...`,
    });
    return response;
  }

  async savePurchase(input: SavePurchaseInput) {
    const { dispatch, lastPurchasedMap, userId, password } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) return;

    if (!lastPurchasedMap) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No lastPurchasedMap given in savePurchase()',
        }),
      );
      return null;
    }

    const body = JSON.stringify({
      lastPurchasedMap,
      userId,
      password,
    } as SavePurchaseRequest);

    const response = await this.makeCall<SavePurchaseResponse>({
      dispatch,
      body,
      options: {
        method: 'POST',
      },
      path: LAST_PURCHASED_PATH,
      errorMsg: `Unable to save purchase.`,
      loadingMsg: `Saving purchase...`,
    });
    return response;
  }

  async saveStore(input: SaveStoreInput) {
    const { dispatch, store, userId, password } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) return;

    if (!store) {
      handleError(dispatch, {
        statusCode: 500,
        message: 'No store given in saveStore()',
      });
      return null;
    }

    const body = JSON.stringify({
      store,
      userId,
      password,
    } as SaveStoreRequest);

    const response = await this.makeCall<SaveStoreResponse>({
      dispatch,
      body,
      options: {
        method: 'POST',
      },
      path: STORE_PATH,
      errorMsg: `Unable to save '${store.name}'.`,
      loadingMsg: `Saving store '${store.name}'...`,
    });
    return response;
  }

  async updateUser(input: UpdateUserInput) {
    const { dispatch, userId, password } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) return;

    const body = JSON.stringify({ userId, password });
    const response = await this.makeCall({
      dispatch,
      body,
      options: {
        method: 'PUT',
      },
      path: USER_PATH,
      errorMsg: `Unable to update user with id of '${userId}'`,
      loadingMsg: `Updating user with id of '${userId}'...`,
    });
    return response;
  }

  //#region Private Methods
  private getStandardizedItem(item: Item) {
    const toReturn = {
      ...item,
      needsSaving: item?.needsSaving !== undefined ? item.needsSaving : true,
      unit: item?.unit || ITEM_UNIT_INITIAL,
    } as Item;
    return toReturn;
  }

  private getStandardizedStore(store: Store) {
    const toReturn = {
      ...store,
      needsSaving: store?.needsSaving !== undefined ? store.needsSaving : true,
    } as Store;
    return toReturn;
  }
}

export const BFF_SERVICE = new BffService();
