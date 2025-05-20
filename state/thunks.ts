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
  completePurchase,
  handleSaveAllResponse,
  removeItemsListItems,
  removeStoresListItems,
  handleLoadAllResponse,
  setCurrentLocationState,
  addInventoryLocations,
  insertInventoryItems,
  moveInventoryItemExpirationDates,
  moveInventoryItems,
  removeInventoryItems,
  removeInventoryLocations,
  removeMostRecentInventoryItem,
  setInventory,
} from './slices/listsSlice';
import { RootState } from './store';

import { GenericResponse } from '@/components/services/AbstractService';
import { BFF_SERVICE } from '@/components/services/BffService';
import {
  GEO_CODING_SERVICE,
  ReverseGeocodingResponse,
} from '@/components/services/GeoCodingService';
import { EMPTY_NUMBER, EMPTY_STRING } from '@/constants/general';
import { LOCAL_FILE_REGEX } from '@/constants/regexs';
import { Item, LastPurchasedMap } from '@/types/Item';
import { GpsCoordinate, Store } from '@/types/Store';
import {
  ChangePasswordResponse,
  ProcessGroceryListResponse,
  UserAccountInput,
  CreateUserResponse,
  DeleteUserResponse,
  LoginResponse,
  DeletionResponse,
  LoadAllResponse,
  SaveAllResponse,
  SaveItemResponse,
  SavePurchaseResponse,
  SaveStoreResponse,
  MakeCallInput,
  UserAccount,
  ProcessedGroceryListItem,
  SaveInventoryLocationsResponse,
  DeleteInventoryLocationsResponse,
  DeleteInventoryItemsResponse,
  MoveInventoryItemsResponse,
  MoveInventoryItemExpirationDatesResponse,
} from '@/types/bffService';
import { Error, SetAppDataInput, State } from '@/types/general';
import { Inventory, MoveInventoryItemExpirationDates } from '@/types/inventory';
import {
  InsertInventoryItemPayload,
  MoveInventoryItemPayload,
  RemoveInventoryItemPayload,
} from '@/types/inventorySlice';
import { ItemFormOnSave } from '@/types/itemForm';
import { AddStoresListItemPayload } from '@/types/listSlice';
import { getExpirationDates } from '@/utils/getExpirationDates';
import { getMostRecentExpirationDates } from '@/utils/getMostRecentExpirationDates';
import {
  getKeyToUse,
  handleError,
  getUserCredentials,
  deleteFile,
  getCustomImageInfo,
  getS3ObjectKey,
  uriToBlob,
} from '@/utils/helpers';
import { logWhenDevelopmentMode } from '@/utils/logging';

export type AddInventoryItemsInput = InsertInventoryItemPayload[];

export type AddInventoryLocationInput = Pick<Inventory, 'locations'>;
export type DeleteInventoryItemsThunkInput = RemoveInventoryItemPayload[];
export type DeleteInventoryLocationInput = AddInventoryLocationInput;

export type DeleteItemsThunkInput = {
  items: Item[];
};
export type DeleteMostRecentInventoryItemThunkInput = Omit<
  RemoveInventoryItemPayload,
  'expirationDates'
>;
export type DeleteStoresThunkInput = {
  stores: Store[];
};
export type GetCurrentStoreInput = {
  gpsCoordinate: GpsCoordinate;
} & Pick<MakeCallInput, 'showLoadingMsg'>;
export type MoveInventoryItemExpirationDatesThunkInput =
  MoveInventoryItemExpirationDates[];
export type MoveInventoryItemsThunkInput = MoveInventoryItemPayload[];
export type SaveAllThunkInput = Omit<
  SetAppDataInput,
  'dispatch' | 'upcProducts'
>;
export type SavePurchaseThunkInput = void;

export const addInventoryItemsThunk = createAsyncThunk(
  'addInventoryItemsThunk',
  async (
    inventoryItems: AddInventoryItemsInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    let response: SaveInventoryLocationsResponse;
    let shouldDisplayError = true;

    try {
      if (!inventoryItems || inventoryItems.length === 0)
        throw new Error(
          'Must provide a locationId, itemId and expirationDates in order to save a new inventory item.',
        );
      const state = getState() as RootState;
      const account = state.general.account;

      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }

      const isSuccess = await BFF_SERVICE.saveInventoryItems({
        dispatch,
        ...account,
        inventoryItems: inventoryItems.map((item) => ({
          ...item,
          locationId:
            item.locationId ||
            state.lists.inventory.currentLocationId ||
            EMPTY_STRING,
        })),
      });
      if (!isSuccess) {
        shouldDisplayError = false;
        throw new Error('Unable to save inventory items.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error saving inventory items.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(insertInventoryItems(inventoryItems));
    }
  },
);

export const addInventoryLocationsThunk = createAsyncThunk(
  'addInventoryLocations',
  async (
    input: AddInventoryLocationInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    let response: SaveInventoryLocationsResponse;
    let shouldDisplayError = true;

    try {
      if (!input) throw new Error('Must provide locations to save.');
      const state = getState() as RootState;
      const account = state.general.account;

      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }

      const isSuccess = await BFF_SERVICE.saveInventoryLocations({
        ...input,
        dispatch,
        ...account,
        locations: input.locations,
      });
      if (!isSuccess) {
        shouldDisplayError = false;
        throw new Error('Unable to save locations.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error saving Locations.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(addInventoryLocations(input.locations));
    }
  },
);

export const changePassword = createAsyncThunk(
  'changePassword',
  async (newPassword: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const account = state.general?.account;
    let response: ChangePasswordResponse;
    try {
      response = await BFF_SERVICE.changePassword({
        ...getUserCredentials(account),
        newPassword,
        dispatch,
      });
      if (!response?.success) {
        throw new Error('Error creating user account');
      }
      dispatch(
        setAccount({
          ...account,
          password: newPassword,
        }),
      );
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to change the user password for user account '${account._id}'.`,
      });
    }
  },
);

export const convertImageToList = createAsyncThunk(
  'convertImageToList',
  async (image: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const account = state.general?.account;
    const { _id: userId, password } = account;
    let response: ProcessGroceryListResponse;
    let shouldDisplayError = true;
    try {
      if (!image) {
        throw new Error('No image provided in convertImageToList');
      }

      if (!userId || !password) {
        shouldDisplayError = false;
        throw new Error('No user credentials given');
      }

      response = await BFF_SERVICE.processGroceryList({
        userId,
        password,
        image,
        dispatch,
      });
      if (!response?.items || response.items.length === 0) {
        throw new Error('Error proccessing the image.');
      }
      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to process the image.`,
        shouldDisplayError,
      });
    }
  },
);

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
            inventory: state.lists.inventory,
            items: state.lists.itemsList,
            lastPurchasedMap: state.lists.lastPurchasedMap,
            stores: {
              ...state.lists.storesList,
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

export const deleteMostRecentInventoryItemThunk = createAsyncThunk(
  'deleteMostRecentInventoryItemThunk',
  async (
    input: DeleteMostRecentInventoryItemThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    let response: DeleteInventoryItemsResponse;
    let shouldDisplayError = true;

    try {
      if (!input) throw new Error('Must provide inventory item to delete.');
      const state = getState() as RootState;
      const account = state.general.account;

      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }

      const bulkResult = await BFF_SERVICE.deleteInventoryItems({
        dispatch,
        ...account,
        inventoryItems: [
          {
            ...input,
            locationId:
              input.locationId ||
              state.lists.inventory.currentLocationId ||
              EMPTY_STRING,
            expirationDates: getMostRecentExpirationDates(
              state.lists.inventory.items[input?.locationId || EMPTY_STRING]?.[
                input.itemId
              ]?.expirationDates || {},
              1,
            ),
          },
        ],
      });
      if (!bulkResult) {
        shouldDisplayError = false;
        throw new Error('Unable to delete item.');
      }
      dispatch(removeMostRecentInventoryItem(input));
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error deleting inventory item.  Please try again later.`,
        shouldDisplayError,
      });
    }
  },
);

export const deleteInventoryItemsThunk = createAsyncThunk(
  'deleteInventoryItemsThunk',
  async (
    input: DeleteInventoryItemsThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    let response: DeleteInventoryItemsResponse;
    let shouldDisplayError = true;

    try {
      if (!input || input.length === 0)
        throw new Error('Must provide inventory items to delete.');
      const state = getState() as RootState;
      const account = state.general.account;

      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }

      const isSuccess = await BFF_SERVICE.deleteInventoryItems({
        ...input,
        dispatch,
        ...account,
        inventoryItems: input.map((item) => ({
          ...item,
          locationId:
            item.locationId ||
            state.lists.inventory.currentLocationId ||
            EMPTY_STRING,
        })),
      });
      if (!isSuccess) {
        shouldDisplayError = false;
        throw new Error('Unable to delete items.');
      }
      dispatch(removeInventoryItems(input));
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error deleting inventory items.  Please try again later.`,
        shouldDisplayError,
      });
    }
  },
);

export const deleteInventoryLocationsThunk = createAsyncThunk(
  'deleteInventoryLocationsThunk',
  async (
    input: DeleteInventoryLocationInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    let response: DeleteInventoryLocationsResponse;
    let shouldDisplayError = true;

    try {
      if (!input) throw new Error('Must provide locations to delete.');
      const state = getState() as RootState;
      const account = state.general.account;

      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }

      const isSuccess = await BFF_SERVICE.deleteInventoryLocations({
        ...input,
        dispatch,
        ...account,
        locations: input.locations,
      });
      if (!isSuccess) {
        shouldDisplayError = false;
        throw new Error('Unable to save locations.');
      }
      dispatch(removeInventoryLocations(input.locations));
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Error saving Locations.  Please try again later.`,
        shouldDisplayError,
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
  async (input: GetCurrentStoreInput, { dispatch, rejectWithValue }) => {
    const { gpsCoordinate, showLoadingMsg = true } = input;
    const { lat, lon } = gpsCoordinate;
    let response: ReverseGeocodingResponse | GenericResponse;
    try {
      response = await GEO_CODING_SERVICE.doReverseGeoCoding({
        gpsCoordinate,
        dispatch,
        loadingMsg: `Finding the current state for lat: ${lat}, lon: ${lon}`,
        showLoadingMsg,
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
  'loadAll',
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
      dispatch(setInventory(response.inventory || {}));
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

      const itemsNeedingSaving = items.data.filter(
        (item) => item.needsSaving && !getCustomImageInfo(item)?.[0],
      );
      const itemsWithCustomImage = items.data.filter(
        (item) => !!getCustomImageInfo(item)?.[0],
      );

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

      // Save all custom images
      const actions = [] as AsyncThunkAction<
        void,
        ItemFormOnSave,
        AsyncThunkConfig
      >[];
      itemsWithCustomImage.forEach((item) => {
        actions.push(
          saveItem({
            hasKeyChanged: false,
            originalKey: item,
            item: {
              ...item,
              needsSaving: false,
              hasBeenSaved: true,
            },
            storeSpecificValues: input.storeSpecificValues[getKeyToUse(item)],
          }),
        );
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

export const saveItem = createAsyncThunk(
  'saveItem',
  async (input: ItemFormOnSave, { getState, dispatch, rejectWithValue }) => {
    if (!input) throw new Error('Must provide payload to save.');
    const state = getState() as RootState;
    const account = state.general.account;
    let response: SaveItemResponse;
    let shouldDisplayError = true;
    const newImages = [...input.item.images];

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

      const [savedImageUrl, savedImageIndex, customImageUrl] =
        await saveCustomImageToS3(itemToDispatch.item, account, dispatch);

      if (!input.item.needsSaving && !savedImageUrl) {
        shouldDisplayError = false;
        throw new Error('No need to save item.');
      } else if (savedImageUrl) {
        newImages[savedImageIndex] = savedImageUrl;
        itemToDispatch.item.images = newImages;
      }

      dispatch(setLoading(`Saving '${getKeyToUse(input.item)}' in Database`));
      response = await BFF_SERVICE.saveItem({
        ...input,
        dispatch,
        ...account,
        item: itemToDispatch.item,
      });
      if (!response?._id) {
        if (!input.item.hasBeenSaved) {
          newImages[savedImageIndex] = customImageUrl;
          itemToDispatch.item.images = newImages;
          const objectKey = getS3ObjectKey(savedImageUrl);
          await BFF_SERVICE.deleteS3Objects({
            dispatch,
            objKeys: objectKey ? [objectKey] : [],
            ...getUserCredentials(account),
          });
        }

        throw new Error(`Unable to save ${getKeyToUse(itemToDispatch.item)}`);
      }
      deleteFile(customImageUrl);
      itemToDispatch.item.needsSaving = false;
      itemToDispatch.item.hasBeenSaved = true;
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

export const moveInventoryItemsThunk = createAsyncThunk(
  'moveInventoryItems',
  async (
    input: MoveInventoryItemsThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const account = state.general.account;
    let shouldDisplayError = true;
    let response: MoveInventoryItemsResponse;

    if (!input) {
      handleError(dispatch, {
        message: 'Must provide payload to transfer inventory items.',
      });
    }
    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No user account info given.');
      }
      const isSuccess = await BFF_SERVICE.moveInventoryItems({
        ...input,
        dispatch,
        ...account,
        itemsToMove: input.map((item) => ({
          ...item,
          originLocationId:
            item.originLocationId ||
            state.lists.inventory.currentLocationId ||
            EMPTY_STRING,
        })),
      });
      if (!isSuccess) {
        shouldDisplayError = false;
        throw new Error('Unable to move inventory items in database.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to save action of moving inventory items.  Try again later.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(moveInventoryItems(input));
    }
  },
);

export const moveInventoryItemExpirationDatesThunk = createAsyncThunk(
  'moveInventoryItemExpirationDates',
  async (
    input: MoveInventoryItemExpirationDatesThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const account = state.general.account;
    let shouldDisplayError = true;
    let response: MoveInventoryItemExpirationDatesResponse;

    if (!input) {
      handleError(dispatch, {
        message:
          'Must provide payload to transfer inventory item expiration dates.',
      });
    }
    try {
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No user account info given.');
      }
      const isSuccess = await BFF_SERVICE.moveInventoryItemExpirationDates({
        ...input,
        dispatch,
        ...account,
        itemsToMove: input.map((item) => ({
          ...item,
          originLocationId:
            item.originLocationId ||
            state.lists.inventory.currentLocationId ||
            EMPTY_STRING,
          expirationDates: getExpirationDates(item.expirationDates),
        })),
      });
      if (!isSuccess) {
        shouldDisplayError = false;
        throw new Error(
          'Unable to move inventory item expiration dates in database.',
        );
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to save action of moving inventory item expiration dates.  Try again later.`,
        shouldDisplayError,
      });
    } finally {
      dispatch(moveInventoryItemExpirationDates(input));
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
export function handleErrorsWithRejection<T>(
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
  const detailsMsg =
    response === undefined ? 'The server cannot be reached.' : genericMsg;
  const messageToUse = `${baseMsg}  ${detailsMsg}`;
  if (shouldDisplayError) {
    handleError(dispatch, error as Error, messageToUse);
  }
  return rejectWithValue(messageToUse);
}

async function saveCustomImageToS3(
  item: Item,
  account: UserAccount,
  dispatch: Dispatch,
): Promise<ProcessedGroceryListItem> {
  logWhenDevelopmentMode({ item, account });
  const defaultReturn = [EMPTY_STRING, EMPTY_NUMBER, EMPTY_STRING] as [
    string,
    number,
    string,
  ];
  try {
    const customImageUrlIndex = item.images.findIndex((image) =>
      image.match(LOCAL_FILE_REGEX),
    );
    const customImageUrl = item.images[customImageUrlIndex];

    if (!customImageUrl || !customImageUrl.match(LOCAL_FILE_REGEX)) {
      throw new Error('No need to save image in saveImage.');
    }
    if (!account._id || !account.password) {
      throw new Error('No credentials found');
    }

    const split = customImageUrl.split('/');
    const filename = split[split.length - 1];

    logWhenDevelopmentMode({ filename, customImageUrl });
    const signedUrlResponse = await BFF_SERVICE.getSignedUrlForUpload({
      dispatch,
      ...getUserCredentials(account),
      filename,
    });

    logWhenDevelopmentMode({ signedUrlResponse });

    if (!signedUrlResponse?.uploadUrl || !signedUrlResponse.downloadUrl) {
      throw new Error('Unable to get signed url.');
    }

    const blob = await uriToBlob(customImageUrl);
    if (!blob) {
      return defaultReturn;
    }

    const savedResponse = await fetch(signedUrlResponse.uploadUrl, {
      body: blob,
      method: 'PUT',
    });

    logWhenDevelopmentMode({ savedResponse });

    if (!savedResponse.ok) {
      throw new Error('Unable to save image.');
    }

    return [signedUrlResponse.downloadUrl, customImageUrlIndex, customImageUrl];
  } catch (error) {
    logWhenDevelopmentMode({ source: 'saveCustomImageToS3', error });
    return defaultReturn;
  }
}
