import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Insets } from 'react-native';

import { ListFilterFilters } from '@/components/lists/ListFilter';
import { SortType, SortOrder } from '@/components/lists/sorters';
import {
  DAY_IN_MS,
  EMPTY_STRING,
  FREQUENCY_INITIAL,
  HOUR_IN_MS,
  IMAGE_PICKER_QUALITY_INITIAL,
  IMAGE_PRIORITY_MAPPING,
  WEEK_IN_MS,
} from '@/constants/general';
import { LOCAL_FILE_REGEX } from '@/constants/regexs';
import { Key, List } from '@/types/Item';
import { GpsCoordinate, Store } from '@/types/Store';
import { UpcProduct } from '@/types/UpcResponse';
import { Frequency, TimeSpan } from '@/types/general';

export function calculateDistance(
  gpsCoordinateStart: GpsCoordinate | null | undefined,
  gpsCoordinateEnd: GpsCoordinate | null | undefined,
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

export function getEmptyList<T>() {
  return {
    data: getEmptyArray<T>(),
    filters: getEmptyObject<T>(),
    sortOrderValue: {
      sortBy: SortType.Name,
      sortOrder: SortOrder.Ascending,
    },
  } as List<T>;
}

export function getEmptyObject<T>() {
  return {} as T;
}

export function getFilteredList<T>(list: T[], filters: ListFilterFilters<T>) {
  return list.filter((item) => {
    for (const [key, regex] of Object.entries(filters)) {
      const fieldValue = item?.[key as keyof T] as string;
      const isMatch = fieldValue.match(new RegExp(regex as string, 'i'));
      if (!isMatch) return false;
    }
    return true;
  });
}

export function getKeyToUse(key: string | Key, displayAlert = true) {
  if (typeof key === 'string') return key;
  const toReturn = key?.upc || key?.name || EMPTY_STRING;

  if (!toReturn && displayAlert) {
    alert(
      'No key given.  Please delete the item in question and ensure there is either a upc or name given.',
    );
  }

  return toReturn;
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
    console.log('Continuing without high accuracy mode');
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

export function getImagePickerOptions(quality = IMAGE_PICKER_QUALITY_INITIAL) {
  return {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality,
    selectionLimit: 1,
  } as ImagePicker.ImagePickerOptions;
}

export function getItemFromList<T extends Key>(list: T[], key: string | Key) {
  const keyToUse = getKeyToUse(key);
  const itemFound =
    list.find((item) => {
      if (item?.name && item?.upc) return item.upc === keyToUse;
      return item?.name === keyToUse;
    }) || null;
  return itemFound ? (itemFound as T) : null;
}

export function getImagesFromUpcProduct(upcProduct?: UpcProduct | null) {
  return Object.values(IMAGE_PRIORITY_MAPPING).map(
    (key) => upcProduct?.[key] || EMPTY_STRING,
  );
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

export function getStoreWithDistance(
  store: Store,
  currentLocation: GpsCoordinate | null,
) {
  return {
    ...store,
    calculatedDistance: calculateDistance(
      store.gpsCoordinates,
      currentLocation,
    ),
  };
}

export async function captureImage() {
  try {
    const result = await ImagePicker.launchCameraAsync(getImagePickerOptions());

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  } catch (error) {
    console.log({ error });
  }
}

export async function pickImage() {
  try {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync(
      getImagePickerOptions(),
    );

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  } catch (error) {
    console.log({ error });
  }
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

export async function saveAppStateToFile(fileName: string, toSave: object) {
  try {
    const content = JSON.stringify(toSave);
    const filePath = `${FileSystem.documentDirectory}${fileName}.json`;

    await FileSystem.writeAsStringAsync(filePath, content);
  } catch (error) {
    displayAlert({ message: 'Error saving app state:', error });
  }
}

export async function loadAppStateFromFile(fileName: string) {
  try {
    const filePath = `${FileSystem.documentDirectory}${fileName}.json`;
    const content = await FileSystem.readAsStringAsync(filePath);

    if (content) {
      const state = JSON.parse(content);
      return state;
    }
  } catch (error) {
    displayAlert({ message: 'Error loading app state:', error });
  }
  return null;
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
