import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch } from '@reduxjs/toolkit';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import _ from 'lodash';
import React from 'react';
import { Insets } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';

import { handleLastPurchasedMapImport } from './handleLastPurchasedMapImport';
import { handleStoreSpecificValuesImport } from './handleStoreSpecificValuesImport';

import { ListFilterFilters } from '@/components/lists/ListFilter';
import { ConfirmModalProps } from '@/components/modals/ConfirmModal';
import { ItemTileViewingMode } from '@/components/tiles/ItemTile';
import {
  DAY_IN_MS,
  EMPTY_NUMBER,
  EMPTY_STRING,
  ERROR_MODAL_STATUS_CODE_DEFAULT,
  FILE_NAMES,
  FREQUENCY_INITIAL,
  HOUR_IN_MS,
  IMAGE_QUALITY,
  SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT,
  SORT_ORDER_VALUE_BY_NAME_DEFAULT,
  WEEK_IN_MS,
} from '@/constants/general';
import {
  AMAZON_S3_REGEX,
  LOCAL_FILE_REGEX,
  POSTAL_CODE_REGEX,
  UPC_REGEX,
  UPC_REQUIRED_CHAR_LENGTH,
} from '@/constants/regexs';
import { setError } from '@/state/slices/generalSlice';
import {
  setItemsList,
  setLastPurchasedMap,
  setStoresList,
  setStoreSpecificValues,
} from '@/state/slices/listsSlice';
import { setUpcProducts } from '@/state/slices/scannerSlice';
import { Item, ItemUnit, Key, List } from '@/types/Item';
import { GpsCoordinate, Store } from '@/types/Store';
import { UserAccount, CredentialsNeeded } from '@/types/bffService';
import {
  Address,
  CurrentLocation,
  Error,
  FileNames,
  Frequency,
  SetAppDataInput,
  State,
  TimeSpan,
} from '@/types/general';
import { ListName } from '@/types/listSlice';

export async function wait(ms: number) {
  if (ms <= 0) return;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

export function calculateDistance(
  gpsCoordinateStart: CurrentLocation | undefined,
  gpsCoordinateEnd: CurrentLocation | undefined,
) {
  const { lat: lat1, lon: lon1 } = gpsCoordinateStart || {};
  const { lat: lat2, lon: lon2 } = gpsCoordinateEnd || {};

  if (lat1 == null || lat2 == null || lon1 == null || lon2 == null) return -1;

  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * parseFloat(lat1)) / 180;
  const radLon1 = (Math.PI * parseFloat(lon1)) / 180;
  const radLat2 = (Math.PI * parseFloat(lat2)) / 180;
  const radLon2 = (Math.PI * parseFloat(lon2)) / 180;

  // Calculate the differences between coordinates
  const deltaLat = radLat2 - radLat1;
  const deltaLon = radLon2 - radLon1;

  // Haversine formula to calculate distance
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Earth's radius in kilometers (you can use 3959 for miles)
  const radius = 6371;

  // Calculate the distance
  const distance = radius * c;

  return Math.round(distance * 100) / 100;
}

export function camelCaseToSpacedCapitalized(str: string) {
  // Use regex to insert spaces before uppercase letters
  // and then capitalize the first letter of each word
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

export async function delay(ms: number) {
  if (ms <= 0) return;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

export async function deleteImages(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    if (!imageUrl.match(LOCAL_FILE_REGEX)) {
      continue;
    }
    console.log('deleting ' + imageUrl);
    deleteFile(imageUrl);
  }
}

export async function deleteFile(path: string) {
  if (!path) return;
  try {
    console.log(`deleting '${path}'...`);
    await FileSystem.deleteAsync(path);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function displayAlert(object: object | null) {
  alert(object ? JSON.stringify(object, null, 2) : object);
}

export function getAddressString(
  address: Address | null,
  includePreposition = false,
) {
  const cityToUse = address?.city ? ` ${address.city}` : EMPTY_STRING;
  const stateToUse =
    address?.state !== State.None ? ` ${address?.state}` : EMPTY_STRING;
  const zipToUse = address?.zipCode ? ` ${address.zipCode}` : EMPTY_STRING;
  const separatingComma = cityToUse && stateToUse ? ', ' : EMPTY_STRING;
  const preposition = cityToUse || stateToUse ? 'in' : 'at';
  const prepositionString = includePreposition
    ? `${preposition} `
    : EMPTY_STRING;
  return `${prepositionString}${cityToUse.trim()}${separatingComma}${stateToUse.trim()}${zipToUse}`.replaceAll(
    '  ',
    ' ',
  );
}

export function getAreStoresEqual(storeOne?: Store, storeTwo?: Store) {
  if (!storeOne || !storeTwo) return false;
  return _.isEqualWith(
    storeOne,
    storeTwo,
    (storeOneLocal: Store, storeTwoLocal: Store) => {
      if (
        _.isEqual(
          storeOneLocal?.gpsCoordinates,
          storeTwoLocal?.gpsCoordinates,
        ) &&
        storeOneLocal.name === storeTwoLocal.name
      ) {
        return true;
      }
      return false;
    },
  );
}

/**
 *Default is 10 for each side
 **/
export function getButtonHitSlop(multiplier = 1) {
  return {
    top: 10 * multiplier,
    bottom: 10 * multiplier,
    left: 10 * multiplier,
    right: 10 * multiplier,
  } as Insets;
}

export function getEmptyArray<T>() {
  return [] as T;
}

export function getEmptyList<T>(listName?: ListName) {
  return {
    data: getEmptyArray<T>(),
    filters: getEmptyObject<T>(),
    sortOrderValue: getSortOrderValues(listName || ListName.ItemsList),
  } as List<T>;
}

export function getEmptyItem(): Item {
  return {
    _id: EMPTY_STRING,
    addedDate: Date.now(),
    frequency: EMPTY_NUMBER,
    fullscreenImage: EMPTY_STRING,
    hasBeenSaved: false,
    images: [],
    imageToUseIndex: 0,
    lastUpdatedDate: Date.now(),
    name: EMPTY_STRING,
    needsSaving: true,
    unit: ItemUnit.Package,
    upc: EMPTY_STRING,
  };
}

export function getEmptyObject<T>() {
  return {} as T;
}

export function getFilteredList<T>(list: T[], filters: ListFilterFilters<T>) {
  return (list || []).filter((item) => {
    for (const [key, regex] of Object.entries(filters || {})) {
      const fieldValue = item?.[key as keyof T] as string;
      const isMatch = fieldValue.match(new RegExp(regex as string, 'i'));
      if (!isMatch) return false;
    }
    return true;
  });
}

export function getId() {
  return uuidV4();
}

export function getIsDevelopmentMode() {
  return process.env.EXPO_PUBLIC_ENV?.match(/dev/);
}

export function getIsPreviouslyPurchasedItemRecommended(
  item: Item,
  lastPurchaseDate: number | undefined,
) {
  const now = Date.now();
  return !!(
    item.frequency &&
    lastPurchaseDate &&
    lastPurchaseDate + item.frequency <= now
  );
}

export function getIsValidUpcValue(value: string) {
  return !!UPC_REGEX.test(value);
}

export function getItemValidation(item?: Key) {
  const isValid = !!item?.name;
  return {
    isValid,
    message: isValid ? EMPTY_STRING : 'Please enter a name',
  };
}

export function getKeyToUse(key: string | Key, displayAlert = false) {
  if (typeof key === 'string') return key;
  const sanitizedKey = sanitizeKey(key);
  const toReturn =
    sanitizedKey?._id ||
    sanitizedKey?.upc ||
    sanitizedKey?.name ||
    EMPTY_STRING;

  if (!toReturn && displayAlert) {
    alert(
      'No key given.  Please delete the item in question and ensure there is either a upc or name given.',
    );
  }

  return toReturn;
}

export function getKeyToUseFieldName(key: Key) {
  if (!key) return EMPTY_STRING;
  return key.upc ? 'upc' : 'name';
}

export function getFrequencyValue(number?: number): Frequency {
  if (!number)
    return {
      ...FREQUENCY_INITIAL,
    };

  let numberToUse = FREQUENCY_INITIAL.number;
  let timeSpan: TimeSpan = FREQUENCY_INITIAL.timeSpan;
  if (number % WEEK_IN_MS === 0) {
    numberToUse = number / WEEK_IN_MS;
    timeSpan = TimeSpan.Week;
  } else if (number % DAY_IN_MS === 0) {
    numberToUse = number / DAY_IN_MS;
    timeSpan = TimeSpan.Day;
  } else {
    numberToUse = number / HOUR_IN_MS;
    timeSpan = TimeSpan.Hour;
  }

  return {
    number: numberToUse,
    timeSpan,
  };
}

export function getDurationFromFrequency(frequency?: Frequency) {
  if (!frequency || !frequency.number || !frequency.timeSpan) return 0;
  let multiplier: number;
  switch (frequency.timeSpan) {
    case TimeSpan.Hour:
      multiplier = HOUR_IN_MS;
      break;
    case TimeSpan.Day:
      multiplier = DAY_IN_MS;
      break;
    case TimeSpan.Week:
      multiplier = WEEK_IN_MS;
      break;
    default:
      multiplier = 0;
      break;
  }
  return multiplier * frequency.number;
}

export async function getGpsCoordinate(): Promise<GpsCoordinate> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  try {
    await Location.enableNetworkProviderAsync();
  } catch (error) {
    console.log('Continuing without high accuracy mode:' + error);
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });
  if (!location?.coords) {
    return {
      lat: '-1',
      lon: '-1',
    };
  }
  return {
    lat: location.coords.latitude.toString(),
    lon: location.coords.longitude.toString(),
  };
}

export function getCustomImageInfo(item: Item): [string, number] {
  const defaultReturn = [EMPTY_STRING, -1] as [string, number];
  if (!item || !item.images || item.images.length === 0) return defaultReturn;
  const customImageUrlIndex = item.images.findIndex((image) =>
    image.match(LOCAL_FILE_REGEX),
  );
  const customImageUrl = item.images?.[customImageUrlIndex];
  if (!customImageUrl) return defaultReturn;
  return [customImageUrl, customImageUrlIndex];
}

export function getImagePickerOptions(
  options?: ImagePicker.ImagePickerOptions,
) {
  return {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: IMAGE_QUALITY,
    selectionLimit: 1,
    ...options,
  } as ImagePicker.ImagePickerOptions;
}

export function getItemForImport<T extends Key>(itemKey: string, items: T[]) {
  if (!itemKey || !items || items.length === 0) return null;
  return items.find((item) => {
    if (item._id && itemKey === item._id) {
      return true;
    }
    if (item.upc) {
      return (item.upc || item.name) === itemKey;
    }
    return item.name === itemKey;
  });
}

export function getItemFromList<T extends Key>(list: T[], key: string | Key) {
  const keyToUse = getKeyToUse(key);
  const itemFound =
    list.find((item) => {
      if (typeof key === 'string') {
        const fieldToUse = key.match(UPC_REGEX)
          ? item.upc
          : item._id || item.name;
        return fieldToUse === keyToUse;
      }
      if (item?._id) return item._id === keyToUse;
      if (item?.name && item?.upc) return item.upc === keyToUse;
      return item?.name === keyToUse;
    }) || null;
  return itemFound ? (itemFound as T) : null;
}

export function getIndexOfSmallestField<T>(arr: T[], key: keyof T) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return -1; // Handle invalid input
  }

  let smallestIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i][key] < arr[smallestIndex][key]) {
      smallestIndex = i;
    }
  }

  return smallestIndex;
}

export function getNewViewingMode(viewingMode: ItemTileViewingMode) {
  return viewingMode === ItemTileViewingMode.Basic
    ? ItemTileViewingMode.Full
    : ItemTileViewingMode.Basic;
}

export function getS3ObjectKey(url: string) {
  try {
    if (!url) return EMPTY_STRING;
    let urlToUse = url;
    if (!url.match(/http/)) {
      urlToUse = `https://${url}`;
    }
    const objKey = new URL(urlToUse)?.pathname?.substring(1);
    return objKey || EMPTY_STRING;
  } catch (error) {
    return EMPTY_STRING;
  }
}

export function getS3Images(images: string[]) {
  if (!images || images.length === 0) return [];
  return images.filter((image) => image.match(AMAZON_S3_REGEX));
}

export function getSortOrderValues(listName: ListName) {
  switch (listName) {
    case ListName.InCartList:
    case ListName.ShoppingList:
      return SORT_ORDER_VALUE_BY_AISLE_NUMBER_DEFAULT;
    case ListName.PreviouslyPurchased:
    case ListName.StoresList:
    case ListName.ItemsList:
    default:
      return SORT_ORDER_VALUE_BY_NAME_DEFAULT;
  }
}

export function getStandardizedUpcValue(upc?: string) {
  if (!upc || upc.length < UPC_REQUIRED_CHAR_LENGTH) return EMPTY_STRING;
  return upc?.length === UPC_REQUIRED_CHAR_LENGTH + 1 ? upc.substring(1) : upc;
}

export function getStateFromString(stateStr?: string): State {
  if (!stateStr) return State.None;
  if (Object.values(State).includes(stateStr as State))
    return stateStr as State;
  const value = State[stateStr as keyof typeof State];
  return value ? value : State.None;
}

export function getStoreWithDistance(
  store: Store,
  currentLocation: CurrentLocation,
) {
  return {
    ...store,
    calculatedDistance: calculateDistance(
      store.gpsCoordinates,
      currentLocation,
    ),
  };
}

export function getUserCredentials(
  userAccount: UserAccount,
): CredentialsNeeded {
  return {
    userId: userAccount._id || EMPTY_STRING,
    password: userAccount.password || EMPTY_STRING,
  };
}

export function handleError(
  dispatch: Dispatch,
  error: Error,
  message?: string,
) {
  dispatch(
    setError({
      message: message || error.message,
      error,
      statusCode: ERROR_MODAL_STATUS_CODE_DEFAULT,
    }),
  );
}

export function isAddressValid(address: Address) {
  const { addressLineOne, city, state, zipCode } = address || {};
  const isAddressValid = !!addressLineOne;
  const isLocationPresent =
    !!city || state !== State.None || zipCode?.match(POSTAL_CODE_REGEX);
  return !!(isAddressValid && isLocationPresent);
}

export function joinWithAnd(array: (string | undefined)[]) {
  if (array.length === 0) {
    return '';
  } else if (array.length === 1) {
    return array[0];
  } else if (array.length === 2) {
    return array.join(' and ');
  } else {
    const lastItem = array.pop(); // Remove the last item from the array
    return array.join(', ') + ', and ' + lastItem;
  }
}

/**
 *Attempts to get permissions to save to a directory and return the selected path in the filesystem.  Throws all errors.
 **/
export async function getDirectory() {
  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted)
    throw new Error('You must allow permission to save.');
  return permissions.directoryUri;
}

export async function captureImage(options?: ImagePicker.ImagePickerOptions) {
  try {
    const result = await ImagePicker.launchCameraAsync(
      getImagePickerOptions(options),
    );

    if (!result.canceled) {
      return result.assets[0];
    }
  } catch (error) {
    console.log({ error });
  }
}

export async function makeNewDirectory(dir: string, name: string) {
  try {
    if (!dir || !name) return EMPTY_STRING;
    const newDir = await StorageAccessFramework.makeDirectoryAsync(dir, name);
    const result =
      await StorageAccessFramework.requestDirectoryPermissionsAsync(newDir);
    return (result as any)?.directoryUri;
  } catch {
    return dir;
  }
}

export async function importAppData(directory: string) {
  const toReturn = {} as FileNames;
  try {
    const files = await StorageAccessFramework.readDirectoryAsync(directory);
    for (const file of files) {
      const content = await StorageAccessFramework.readAsStringAsync(file);
      if (content) {
        const parsed = JSON.parse(content);
        const toFind = '%2F';
        const lastSlashIndex = file.lastIndexOf(toFind);
        const fileName = file
          .slice(lastSlashIndex + toFind.length)
          .replace('.json', '');
        toReturn[fileName as keyof typeof FILE_NAMES] = parsed;
      }
    }
    return toReturn;
  } catch (error) {
    displayAlert({ message: 'Error loading app state:', error });
  }
  return toReturn;
}

export async function pickImage(options?: ImagePicker.ImagePickerOptions) {
  try {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync(
      getImagePickerOptions(options),
    );

    if (!result.canceled) {
      return result.assets[0];
    }
  } catch (error) {
    console.log({ error });
  }
}

export function resetConfirmModalProps(
  setConfirmModalProps: (
    value: React.SetStateAction<ConfirmModalProps>,
  ) => void,
) {
  setConfirmModalProps({ isVisible: false });
}

export async function retrieveImagePathFromAsyncStorage(key: Key) {
  try {
    const keyToUse = getKeyToUse(key);
    return await AsyncStorage.getItem(keyToUse);
  } catch (error) {
    console.log('Error retrieving image path in AsyncStorage', error);
    return null;
  }
}

export function roundNumber(number: number, decimalPlaces = 2) {
  if (typeof number !== 'number' || typeof decimalPlaces !== 'number') {
    throw new Error('Both arguments must be numbers');
  }

  if (decimalPlaces < 0) {
    throw new Error('Decimal places must be non-negative');
  }

  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
}

/**
 *@param key the key to use
 *@param uri the link to the image (web)
 **/
export async function saveImageLocally(key: Key, uri: string) {
  try {
    const keyToUse = getKeyToUse(key);
    const imagePath = `${FileSystem.documentDirectory}${keyToUse}`;
    const downloadResumable = FileSystem.createDownloadResumable(
      uri,
      imagePath,
    );
    const response = await downloadResumable.downloadAsync();
    if (response?.status && response.status <= 300) {
      await saveImagePathToAsyncStorage(key, imagePath);
      return imagePath;
    } else {
      console.log(`Unable to save image ${response?.uri}`);
      return '';
    }
  } catch (error) {
    console.log('Error saving image locally', error);
    return '';
  }
}

export async function saveImagePathToAsyncStorage(key: Key, imagePath: string) {
  try {
    const keyToUse = getKeyToUse(key);
    await AsyncStorage.setItem(keyToUse, imagePath);
  } catch (error) {
    console.log('Error storing image path in AsyncStorage', error);
  }
}

export async function saveAppStateToFile(
  fileName: string,
  directory: string,
  toSave: object,
) {
  const content = JSON.stringify(toSave);
  const fileUri = await StorageAccessFramework.createFileAsync(
    directory,
    fileName,
    'application/json',
  );
  await FileSystem.writeAsStringAsync(fileUri, content);
}

export function setAppData(input: SetAppDataInput) {
  const {
    dispatch,
    items,
    lastPurchasedMap,
    storeSpecificValues,
    stores,
    upcProducts,
  } = input;
  items.data.forEach((item) => {
    if (!item._id) {
      item._id = getId();
    }
    if (item.needsSaving == null) {
      item.needsSaving = true;
    }
  });
  stores.data.forEach((store) => {
    if (!store._id) {
      store._id = getId();
    }
    if (store.needsSaving == null) {
      store.needsSaving = true;
    }
  });
  dispatch(
    setStoreSpecificValues(
      handleStoreSpecificValuesImport(
        storeSpecificValues,
        items.data,
        stores.data,
      ),
    ),
  );
  dispatch(
    setLastPurchasedMap(
      handleLastPurchasedMapImport(lastPurchasedMap, items.data, stores.data),
    ),
  );
  dispatch(setItemsList(items));
  dispatch(setStoresList(stores));
  dispatch(setUpcProducts(upcProducts));
}

export async function measureExecutionTime(
  func: () => void,
  key = 'Func',
  shouldLog = true,
) {
  const start = performance.now();
  func && (await func());
  const end = performance.now();
  if (shouldLog) console.log({ [`executionTimeOf${key}`]: end - start });
}

export function sanitizeKey<T extends Key>(key: T) {
  const copy = { ...key };
  if (copy?.name) {
    copy.name = sanitize(copy.name);
  }
  if (copy?.upc) {
    copy.upc = sanitize(copy.upc);
  }
  return copy;
}

/**
 *This is used to sanitize the keys used in documents with a values field (e.g. LastPurchasedMapSchema and StoreSpecificValuesSchema)
 **/
export function sanitize(str?: string) {
  if (!str) return '';
  return str?.replace(/\./g, '');
}

export function trimObjectValues<T>(obj: T ) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      (obj as any)[key] = obj[key].trim();
    }
  }
  return obj as T;
}

export async function uriToBlob(uri: string) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  } catch {
    return null;
  }
}
