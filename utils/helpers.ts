import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch } from '@reduxjs/toolkit';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Insets } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';

import { getIsDevelopmentMode as isDevelopmentMode } from './environment';
import { logWhenDevelopmentMode } from './logging';

import { ListFilterFilters } from '@/components/FilterListInput';
import { ConfirmModalProps } from '@/components/modals/ConfirmModal';
import {
  DAY_IN_MS,
  DURATION_INITIAL,
  DURATION_INITIAL_NUMBER,
  DURATION_INITIAL_TIME_SPAN,
  EMPTY_NUMBER,
  EMPTY_STRING,
  ERROR_MODAL_STATUS_CODE_DEFAULT,
  HOUR_IN_MS,
  IMAGE_QUALITY,
  MONTH_IN_MS,
  TASK_PRIORITY_INITIAL,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
  WEEK_IN_MS,
  YEAR_IN_MS,
} from '@/constants/general';
import { LOCAL_FILE_REGEX, AMAZON_S3_REGEX } from '@/constants/regexs';
import { setError } from '@/state/slices/generalSlice';
import { setTasks } from '@/state/slices/tasksSlice';
import { Key, Task, TaskTileViewingMode } from '@/types/Task';
import { CredentialsNeeded, UserAccount } from '@/types/bffService';
import {
  Address,
  CurrentLocation,
  Duration,
  Error,
  FileNames,
  GpsCoordinate,
  State,
  TimeSpan,
} from '@/types/general';

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
    logWhenDevelopmentMode('deleting ' + imageUrl);
    deleteFile(imageUrl);
  }
}

export async function deleteFile(path: string) {
  if (!path) return;
  try {
    logWhenDevelopmentMode(`deleting '${path}'...`);
    await FileSystem.deleteAsync(path);
    return true;
  } catch (error) {
    logWhenDevelopmentMode(error);
    return false;
  }
}

export function displayAlert(object: object | null) {
  alert(object ? JSON.stringify(object, null, 2) : object);
}

export function ensureMaxLength(str: string, maxLength: number) {
  if (!str) return EMPTY_STRING;
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
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

export function getBackendUrl() {
  return getIsDevelopmentMode()
    ? `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:${process.env.EXPO_PUBLIC_PORT_NUMBER}`
    : 'https://your-production-api.example.com';
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

export function getEmptyObject<T>() {
  return {} as T;
}

export function getEmptyTask(): Task {
  return {
    _id: EMPTY_STRING,
    addedDate: Date.now(),
    code: EMPTY_STRING,
    dueDate: EMPTY_NUMBER,
    hasBeenSaved: false,
    images: [],
    imageToUseIndex: 0,
    isCompleted: false,
    lastUpdatedDate: Date.now(),
    needsSaving: true,
    notes: EMPTY_STRING,
    priority: TASK_PRIORITY_INITIAL,
    title: EMPTY_STRING,
  };
}

export function getFilteredList<T>(list: T[], filters: ListFilterFilters<T>) {
  return (list || []).filter((item) => {
    for (const [key, regex] of Object.entries(filters || {})) {
      const fieldValue = item?.[key as keyof T] as string;
      const isMatch = fieldValue?.match(new RegExp(regex as string, 'i'));
      if (!isMatch) return false;
    }
    return true;
  });
}

export function getId() {
  return uuidV4();
}

export function getIsDevelopmentMode() {
  return isDevelopmentMode();
}

export function getTaskValidation(task?: Key) {
  const isValid = !!task?.title;
  return {
    isValid,
    message: isValid ? EMPTY_STRING : 'Please enter a title',
  };
}

export function getKeyToUse(key: string | Key, displayAlertOnMissing = false) {
  if (typeof key === 'string') return key;
  const sanitizedKey = sanitizeKey(key);
  const toReturn =
    sanitizedKey?._id ||
    sanitizedKey?.code ||
    sanitizedKey?.title ||
    EMPTY_STRING;

  if (!toReturn && displayAlertOnMissing) {
    alert(
      'No key given.  Please delete the task in question and ensure there is either a title or code given.',
    );
  }

  return toReturn;
}

export function getDurationInMilliseconds(duration?: Duration) {
  return (
    (duration?.number || DURATION_INITIAL_NUMBER) *
    TIME_SPAN_TO_MILLISECONDS_MAPPING?.[
      duration?.timeSpan || DURATION_INITIAL_TIME_SPAN
    ]
  );
}

export function getDurationValue(number?: number): Duration {
  if (!number)
    return {
      ...DURATION_INITIAL,
    };

  let numberToUse = DURATION_INITIAL.number;
  let timeSpan: TimeSpan = DURATION_INITIAL.timeSpan;
  if (number % YEAR_IN_MS === 0) {
    numberToUse = number / YEAR_IN_MS;
    timeSpan = TimeSpan.Year;
  } else if (number % MONTH_IN_MS === 0) {
    numberToUse = number / MONTH_IN_MS;
    timeSpan = TimeSpan.Month;
  } else if (number % WEEK_IN_MS === 0) {
    numberToUse = number / WEEK_IN_MS;
    timeSpan = TimeSpan.Week;
  } else if (number % DAY_IN_MS === 0) {
    numberToUse = number / DAY_IN_MS;
    timeSpan = TimeSpan.Day;
  } else {
    numberToUse = Math.ceil(number / HOUR_IN_MS);
    timeSpan = TimeSpan.Hour;
  }

  return {
    number: numberToUse,
    timeSpan,
  };
}

export async function getGpsCoordinate(): Promise<GpsCoordinate> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  try {
    await Location.enableNetworkProviderAsync();
  } catch (error) {
    logWhenDevelopmentMode('Continuing without high accuracy mode:' + error);
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

export function getCustomImageInfo(task: Task): [string, number] {
  const defaultReturn = [EMPTY_STRING, -1] as [string, number];
  if (!task || !task.images || task.images.length === 0) return defaultReturn;
  const customImageUrlIndex = task.images.findIndex((image) =>
    image.match(LOCAL_FILE_REGEX),
  );
  const customImageUrl = task.images?.[customImageUrlIndex];
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

export function getTaskForImport<T extends Key>(taskKey: string, tasks: T[]) {
  if (!taskKey || !tasks || tasks.length === 0) return null;
  return (
    tasks.find((task) => {
      if (task._id && taskKey === task._id) {
        return true;
      }
      if (task.code) {
        return (task.code || task.title) === taskKey;
      }
      return task.title === taskKey;
    }) || null
  );
}

export function getTaskFromList<T extends Key>(list: T[], key: string | Key) {
  const keyToUse = getKeyToUse(key);
  const itemFound =
    (list || []).find((item) => {
      if (item?._id) return item._id === keyToUse;
      if (item?.title && item?.code) return item.code === keyToUse;
      return item?.title === keyToUse;
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

export function getNewViewingMode(viewingMode: TaskTileViewingMode) {
  return viewingMode === TaskTileViewingMode.Basic
    ? TaskTileViewingMode.Full
    : TaskTileViewingMode.Basic;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return EMPTY_STRING;
  }
}

export function getS3Images(images: string[]) {
  if (!images || images.length === 0) return [];
  return images.filter((image) => image.match(AMAZON_S3_REGEX));
}

export function getStateFromString(stateStr?: string): State {
  if (!stateStr) return State.None;
  if (Object.values(State).includes(stateStr as State))
    return stateStr as State;
  const value = State[stateStr as keyof typeof State];
  return value ? value : State.None;
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
  const isLocationPresent = !!city || state !== State.None || !!zipCode;
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
    logWhenDevelopmentMode({ error });
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
        toReturn[fileName as keyof FileNames] = parsed;
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
    logWhenDevelopmentMode({ error });
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
    logWhenDevelopmentMode(
      'Error retrieving image path in AsyncStorage',
      error,
    );
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
      logWhenDevelopmentMode(`Unable to save image ${response?.uri}`);
      return '';
    }
  } catch (error) {
    logWhenDevelopmentMode('Error saving image locally', error);
    return '';
  }
}

export async function saveImagePathToAsyncStorage(key: Key, imagePath: string) {
  try {
    const keyToUse = getKeyToUse(key);
    await AsyncStorage.setItem(keyToUse, imagePath);
  } catch (error) {
    logWhenDevelopmentMode('Error storing image path in AsyncStorage', error);
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

export function setAppData(input: FileNames & { dispatch: Dispatch<any> }) {
  const { dispatch, tasks } = input;
  (tasks || []).forEach((task) => {
    if (!task._id) {
      task._id = getId();
    }
    if (task.needsSaving == null) {
      task.needsSaving = true;
    }
  });
  dispatch(setTasks(tasks || []));
}

export async function measureExecutionTime(
  func: () => Promise<void>,
  key = 'Func',
  shouldLog = true,
) {
  const start = performance.now();
  func && (await func());
  const end = performance.now();
  if (shouldLog)
    logWhenDevelopmentMode({ [`executionTimeOf${key}`]: end - start });
}

export function sanitizeKey<T extends Key>(key: T) {
  const copy = { ...key };
  if (copy?.title) {
    copy.title = sanitize(copy.title);
  }
  if (copy?.code) {
    copy.code = sanitize(copy.code);
  }
  return copy;
}

/**
 *This is used to sanitize keys used as AsyncStorage/document identifiers.
 **/
export function sanitize(str?: string) {
  if (!str) return '';
  return str?.replace(/\./g, '');
}

export async function scheduleNotification(
  request: Notifications.NotificationRequestInput,
) {
  await Notifications.scheduleNotificationAsync(request);
}

export function trimObjectValues<T extends Record<string, any>>(obj: T) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      (obj as any)[key] = value.trim();
    }
  }
  return obj as T;
}

export async function uriToBlob(uri: string) {
  try {
    const response = await fetch(uri);
    logWhenDevelopmentMode({ response, uri });
    const blob = await response.blob();
    logWhenDevelopmentMode({ blob });
    return blob;
  } catch {
    return null;
  }
}
