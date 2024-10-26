import { AsyncThunk, createAsyncThunk, Dispatch } from '@reduxjs/toolkit';
import {
  AsyncThunkAction,
  AsyncThunkConfig,
} from '@reduxjs/toolkit/dist/createAsyncThunk';

import { ACCOUNT_INITIAL, setAccount, setLoading } from './slices/generalSlice';
import { getLastPurchasedFromStoreSpecificValues } from './slices/helpers/getLastPurchasedMapFromStoreSpecificValues';
import {
  listsSlice,
  addItemsListItem,
  addStoresListItem,
  AddStoresListItemPayload,
  completePurchase,
  handleSaveAllResponse,
  removeItemsListItems,
  removeStoresListItems,
  handleLoadAllResponse,
  ListName,
  setCurrentLocationState,
} from './slices/listsSlice';
import { RootState } from './store';

import { ItemFormOnSave } from '@/components/forms/ItemForm';
import { GenericResponse } from '@/components/services/AbstractService';
import {
  BFF_SERVICE,
  CreateUserResponse,
  DeleteUserResponse,
  DeletionResponse,
  LoadAllResponse,
  LoginResponse,
  SaveAllResponse,
  SaveItemResponse,
  SavePurchaseResponse,
  SaveStoreResponse,
  SignedUrlResponse,
  UserAccountInput,
} from '@/components/services/BffService';
import {
  GEO_CODING_SERVICE,
  ReverseGeocodingResponse,
} from '@/components/services/GeoCodingService';
import { EMPTY_STRING } from '@/constants/general';
import { LOCAL_FILE_REGEX } from '@/constants/regexs';
import { Item, LastPurchasedMap } from '@/types/Item';
import { GpsCoordinate, Store } from '@/types/Store';
import { Error, SetAppDataInput, State } from '@/types/general';
import {
  getKeyToUse,
  handleError,
  getUserCredentials,
  uriToBlob,
  deleteFile,
} from '@/utils/helpers';

export type DeleteItemsThunkInput = {
  items: Item[];
};
export type DeleteStoresThunkInput = {
  stores: Store[];
};
export type SaveAllThunkInput = Omit<
  SetAppDataInput,
  'dispatch' | 'upcProducts'
>;
export type SaveImageThunkInput = {
  item: Item;
};
export type SavePurchaseThunkInput = void;

export const createUser = createAsyncThunk(
  'createUser',
  async (user: UserAccountInput, { dispatch, rejectWithValue }) => {
    let response: CreateUserResponse;
    try {
      response = await BFF_SERVICE.createUser({ user, dispatch });
      if (!response?._id) {
        throw new Error('Error creating user account');
      }
      dispatch(
        setAccount({
          ...response,
          password: user?.password,
        }),
      );
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to create the user account for '${user?.email}'.`,
      });
    }
  },
);

export const deleteUser: AsyncThunk<void, void, AsyncThunkConfig> =
  createAsyncThunk(
    'deleteUser',
    async (_, { getState, dispatch, rejectWithValue }) => {
      const state = getState() as RootState;
      const account = state.general?.account;
      let response: DeleteUserResponse;
      try {
        if (!account) {
          throw new Error('No user account found to delete.');
        }
        response = await BFF_SERVICE.deleteUser({
          ...getUserCredentials(account),
          dispatch,
        });
        if (!response?.deletedUser._id) {
          throw new Error('No user account was deleted');
        }
        dispatch(setAccount(ACCOUNT_INITIAL));
      } catch (error) {
        return handleErrorsWithRejection({
          dispatch,
          rejectWithValue,
          error: error as Error,
          response,
          baseMsg: `Unable to delete the user account for '${account._id}'.`,
        });
      }
    },
  );

export const login = createAsyncThunk(
  'login',
  async (user: UserAccountInput, { dispatch, getState, rejectWithValue }) => {
    let response: LoginResponse;
    try {
      response = await BFF_SERVICE.login({ user, dispatch });
      if (!response?._id) {
        throw new Error('No user account was created.');
      }
      dispatch(
        setAccount({
          ...response,
          password: user.password,
        }),
      );

      const state = getState() as RootState;
      if (state.general.shouldSaveOnLogin) {
        dispatch(
          saveAll({
            items: state.lists[ListName.ItemsList],
            lastPurchasedMap: state.lists.lastPurchasedMap,
            stores: {
              ...state.lists[ListName.StoresList],
              currentStoreId: state.lists.currentStoreId,
            },
            storeSpecificValues: state.lists.storeSpecificValuesMap,
          }),
        );
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to login to '${user.email}'.`,
        genericMsg: 'Please check your credentials.',
      });
    }
  },
);

export const deleteItems = createAsyncThunk(
  'deleteItems',
  async (
    input: DeleteItemsThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const account = state.general.account;
    const { items } = input || {};
    const itemsNotInDb = items?.filter((item) => !item.hasBeenSaved) || [];
    const itemsInDb = items?.filter((item) => !!item.hasBeenSaved) || [];
    let response: DeletionResponse;
    let shouldDisplayError = true;

    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        if (itemsInDb.length > 0) {
          const message = `The following items were not deleted since they have been saved before and you are not logged in: ${itemsInDb.map((item) => `'${getKeyToUse(item)}'`).join(', ')}.  Please login an try again.`;
          const error = { message } as Error;
          handleError(dispatch, error, message);
          throw new Error(message);
        }
        throw new Error('No user info found.');
      }
      if (!items || items.length === 0) {
        shouldDisplayError = false;
        throw new Error('No items given.');
      }

      dispatch(setLoading(`Deleting items...`));
      response = await BFF_SERVICE.deleteItems({
        items: itemsInDb,
        dispatch,
        ...getUserCredentials(account),
      });

      if (!response?.acknowledged) {
        throw new Error('Unable to delete items.');
      }
      dispatch(removeItemsListItems(items));
    } catch (error) {
      dispatch(removeItemsListItems(itemsNotInDb));
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to delete items.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
    }
  },
);

export const deleteStores = createAsyncThunk(
  'deleteStores',
  async (
    input: DeleteStoresThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const account = state.general.account;
    let shouldDisplayError = true;
    const { stores } = input;
    const storesInDb = stores?.filter((store) => !!store.hasBeenSaved) || [];
    const storesNotInDb = stores?.filter((store) => !store.hasBeenSaved) || [];
    let storesToDelete = stores;
    let response: DeletionResponse;

    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        storesToDelete = storesNotInDb;
        if (storesInDb.length > 0) {
          const message = `The following stores were not deleted since they have been saved before and you are not logged in: ${storesInDb.map((store) => `'${getKeyToUse(store)}'`).join(', ')}.  Please login an try again.`;
          const error = { message } as Error;
          handleError(dispatch, error, message);
        }
        throw new Error('No user info found.');
      }
      if (!storesInDb || storesInDb.length === 0) {
        shouldDisplayError = false;
        storesToDelete = storesNotInDb;
        throw new Error('No stores given.');
      }
      dispatch(setLoading(`Deleting stores in Database`));
      response = await BFF_SERVICE.deleteStores({
        ids: storesInDb
          .map((store) => store._id || EMPTY_STRING)
          .filter(Boolean),
        dispatch,
        ...getUserCredentials(account),
      });
      if (!response) {
        storesToDelete = storesNotInDb;
        throw new Error('Unable to delete stores.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to delete stores ${storesToDelete.map((store) => `${store.name}`).join(', ')}`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
      if (storesToDelete.length > 0) {
        dispatch(removeStoresListItems(storesToDelete));
      }
    }
  },
);

export const getCurrentState = createAsyncThunk(
  'getCurrentState',
  async (gpsCoordinate: GpsCoordinate, { dispatch, rejectWithValue }) => {
    const { lat, lon } = gpsCoordinate;
    let response: ReverseGeocodingResponse | GenericResponse;
    try {
      response = await GEO_CODING_SERVICE.doReverseGeoCoding({
        gpsCoordinate,
        dispatch,
        loadingMsg: `Finding the current state for lat: ${lat}, lon: ${lon}`,
      });
      if (!response?.address.state) {
        throw new Error('Error getting state');
      }
      dispatch(
        setCurrentLocationState(
          State[response.address.state as keyof typeof State],
        ),
      );
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to determine the state for the current location.`,
      });
    }
  },
);

export const loadAll = createAsyncThunk(
  'saveAll',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const { account } = state.general || {};
    let response: LoadAllResponse;
    let shouldDisplayError = true;

    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No user info found.');
      }
      dispatch(setLoading(`Loading data from database`));
      response = await BFF_SERVICE.loadAllFromDb({
        userId: account._id,
        password: account.password,
        dispatch,
      });
      if (!response) {
        throw new Error('Unable to backup data.');
      }
      dispatch(handleLoadAllResponse(response));
      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to load data from server.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
    }
  },
);

export const saveAll = createAsyncThunk(
  'saveAll',
  async (input: SaveAllThunkInput, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const { account } = state.general || {};
    let response: SaveAllResponse;
    let shouldDisplayError = true;

    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No user info found.');
      }
      const { items, stores } = input;
      dispatch(setLoading(`Saving data to database`));
      const itemsNeedingSaving = items.data.filter((item) => item.needsSaving);
      const storesNeedingSaving = stores.data.filter(
        (store) => store.needsSaving,
      );

      response = await BFF_SERVICE.saveAllToDb({
        ...input,
        items: {
          ...input.items,
          data: itemsNeedingSaving,
        },
        stores: {
          ...input.stores,
          data: storesNeedingSaving,
        },
        dispatch,
        ...account,
      });
      if (!response) {
        throw new Error('Unable to backup data.');
      }
      dispatch(
        handleSaveAllResponse({
          ...response,
          itemsSaved: itemsNeedingSaving,
          storesSaved: storesNeedingSaving,
        }),
      );

      //Save all custom images
      const actions = [] as AsyncThunkAction<
        void,
        SaveImageThunkInput,
        AsyncThunkConfig
      >[];
      items.data.forEach((item) => {
        for (const image of item?.images || []) {
          if (image.match(LOCAL_FILE_REGEX)) {
            actions.push(
              saveCustomImage({
                item,
              }),
            );
            continue;
          }
        }
      });
      await Promise.all(actions.map((promise) => dispatch(promise)));

      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to backup data.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
    }
  },
);

export const saveCustomImage = createAsyncThunk(
  'saveCustomImage',
  async (
    input: SaveImageThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const account = state.general.account;
    let shouldDisplayError = true;
    let signedUrlResponse: SignedUrlResponse;

    try {
      const { item } = input;
      const customImageUrlIndex = item.images.findIndex((image) =>
        image.match(LOCAL_FILE_REGEX),
      );
      const customImageUrl = item.images[customImageUrlIndex];

      if (!customImageUrl || !customImageUrl.match(LOCAL_FILE_REGEX)) {
        shouldDisplayError = false;
        throw new Error('No need to save image in saveImage.');
      }
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No credentials found');
      }

      dispatch(setLoading(`Saving '${customImageUrl}' to cloud...`));
      const split = customImageUrl.split('/');
      const filename = split[split.length - 1];

      signedUrlResponse = await BFF_SERVICE.getSignedUrlForUpload({
        dispatch,
        ...getUserCredentials(account),
        filename,
      });

      if (!signedUrlResponse?.uploadUrl || !signedUrlResponse.downloadUrl) {
        throw new Error('Unable to get signed url.');
      }

      const blob = await uriToBlob(customImageUrl);
      const savedResponse = await fetch(signedUrlResponse.uploadUrl, {
        body: blob,
        method: 'PUT',
      });

      if (!savedResponse.ok) {
        throw new Error('Unable to save image.');
      }

      const newImages = [...item.images];
      newImages[customImageUrlIndex] = signedUrlResponse.downloadUrl;
      console.log({ item, newImages, customImageUrlIndex });
      dispatch(
        addItemsListItem({
          item: {
            ...item,
            images: newImages,
          },
        }),
      );
      deleteFile(customImageUrl);
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response: signedUrlResponse,
        baseMsg: `Error saving image.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
    }
  },
);

export const saveItem = createAsyncThunk(
  'saveItem',
  async (input: ItemFormOnSave, { getState, dispatch, rejectWithValue }) => {
    if (!input) throw new Error('Must provide payload to save.');
    const state = getState() as RootState;
    const account = state.general.account;
    let response: SaveItemResponse;
    let shouldDisplayError = true;

    const itemToDispatch = {
      ...input,
      item: {
        ...input.item,
        needsSaving:
          input.item.needsSaving != null ? input.item.needsSaving : true,
        hasBeenSaved:
          input.item.hasBeenSaved != null ? input.item.hasBeenSaved : false,
      } as Item,
    };

    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }
      if (!input.item.needsSaving) {
        shouldDisplayError = false;
        dispatch(
          saveCustomImage({
            item: itemToDispatch.item,
          }),
        );
        throw new Error('No need to save item.');
      }
      dispatch(setLoading(`Saving '${getKeyToUse(input.item)}' in Database`));
      response = await BFF_SERVICE.saveItem({
        ...input,
        dispatch,
        ...account,
      });
      if (!response?._id) {
        throw new Error(`Unable to save ${getKeyToUse(itemToDispatch.item)}`);
      }
      itemToDispatch.item.needsSaving = false;
      itemToDispatch.item.hasBeenSaved = true;
      dispatch(
        saveCustomImage({
          item: itemToDispatch.item,
        }),
      );
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error saving Item.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
      dispatch(addItemsListItem(itemToDispatch));
    }
  },
);

export const savePurchase = createAsyncThunk(
  'savePurchase',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const account = state.general.account;
    let lastPurchasedMap: LastPurchasedMap = {};
    let shouldDisplayError = true;
    let response: SavePurchaseResponse;

    try {
      const { storeSpecificValuesMap, currentStoreId } = state[listsSlice.name];
      if (!storeSpecificValuesMap)
        throw new Error('Unable to find the storeSpecificValuesMap');

      lastPurchasedMap = getLastPurchasedFromStoreSpecificValues(
        storeSpecificValuesMap,
        currentStoreId,
      );

      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No credentials found');
      }

      dispatch(setLoading(`Saving purchase...`));
      response = await BFF_SERVICE.savePurchase({
        lastPurchasedMap,
        dispatch,
        ...getUserCredentials(account),
      });
      if (!response?._id) {
        shouldDisplayError = false;
        throw new Error('Unable to save purchase to the database');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error saving purchase.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
      dispatch(completePurchase(lastPurchasedMap));
    }
  },
);

export const saveStore = createAsyncThunk(
  'saveStore',
  async (
    input: AddStoresListItemPayload,
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const account = state.general.account;
    let shouldDisplayError = true;
    let response: SaveStoreResponse;

    if (!input) {
      handleError(dispatch, {
        message: 'Must provide payload to save a store.',
      });
    }

    const storeToSave = {
      ...input,
      newStore: {
        ...input.newStore,
        needsSaving:
          input.newStore.needsSaving != null
            ? input.newStore.needsSaving
            : true,
        hasBeenSaved:
          input.newStore.hasBeenSaved != null
            ? input.newStore.hasBeenSaved
            : false,
      },
    } as AddStoresListItemPayload;

    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No user account info given.');
      }
      if (!input.newStore.needsSaving) {
        shouldDisplayError = false;
        throw new Error('No need to save store.');
      }

      dispatch(
        setLoading(`Saving '${getKeyToUse(input.newStore.name)}' in Database`),
      );
      response = await BFF_SERVICE.saveStore({
        store: input.newStore,
        dispatch,
        ...getUserCredentials(account),
      });
      if (!response?._id) {
        throw new Error('Unable to save store.');
      }
      storeToSave.newStore.needsSaving = false;
      storeToSave.newStore.hasBeenSaved = true;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error saving store.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(setLoading(EMPTY_STRING));
      dispatch(addStoresListItem(storeToSave));
    }
  },
);

type HandleErrorsWithRejectionInput<T> = {
  dispatch: Dispatch;
  rejectWithValue: (message: string) => void;
  error: Error;
  response: T | GenericResponse;
  baseMsg: string;
  genericMsg?: string;
  shouldDisplayError?: boolean;
};
function handleErrorsWithRejection<T>(
  input: HandleErrorsWithRejectionInput<T>,
) {
  const {
    dispatch,
    rejectWithValue,
    error,
    response,
    baseMsg,
    genericMsg = 'Please try again.',
    shouldDisplayError = true,
  } = input;
  console.log({ error });
  const detailsMsg =
    response === undefined ? 'The server cannot be reached.' : genericMsg;
  const messageToUse = `${baseMsg}  ${detailsMsg}`;
  if (shouldDisplayError) {
    handleError(dispatch, error as Error, messageToUse);
  }
  return rejectWithValue(messageToUse);
}
