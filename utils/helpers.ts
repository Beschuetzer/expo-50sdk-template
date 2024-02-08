import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import {
  EMPTY_STRING,
  IMAGE_PICKER_OPTIONS,
  IMAGE_PRIORITY_MAPPING,
} from "@/constants/general";
import { Key } from "@/types/Item";
import { UpcProduct } from "@/types/UpcResponse";

export async function delay(ms: number) {
  if (ms <= 0) return;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

export async function deleteFile(path: string) {
  if (!path) return;
  try {
    await FileSystem.deleteAsync(path);
    return true;
  } catch (error) {
    console.error(error)
    return false;
  }
}

export function displayAlert(object: object) {
  alert(JSON.stringify(object, null, 2));
}

export function getEmptyArray<T>() {
  return [] as T;
}

export function getEmptyObject<T>() {
  return {} as T;
}

export function getKeyToUse(key: Key, displayAlert = true) {
  const toReturn = key?.upc || key?.name || EMPTY_STRING;

  if (!toReturn && displayAlert) {
    alert(
      "No key given.  Please delete the item in question and ensure there is either a upc or name given.",
    );
  }

  return toReturn;
}

export function getImagesFromUpcProduct(upcProduct: UpcProduct) {
  return Object.values(IMAGE_PRIORITY_MAPPING).map(
    (key) => upcProduct?.[key] || EMPTY_STRING,
  );
}

export async function captureImage() {
  try {
    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  } catch (error) {
    console.error({ error });
  }
}

export async function pickImage() {
  try {
    // No permissions request is necessary for launching the image library
    const result =
      await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  } catch (error) {
    console.error({ error });
  }
}

export async function retrieveImagePathFromAsyncStorage(key: Key) {
  try {
    const keyToUse = getKeyToUse(key);
    return await AsyncStorage.getItem(keyToUse);
  } catch (error) {
    console.error("Error retrieving image path in AsyncStorage", error);
    return null;
  }
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
      console.error(`Unable to save image ${response?.uri}`);
      return "";
    }
  } catch (error) {
    console.error("Error saving image locally", error);
    return "";
  }
}

export async function saveImagePathToAsyncStorage(key: Key, imagePath: string) {
  try {
    const keyToUse = getKeyToUse(key);
    await AsyncStorage.setItem(keyToUse, imagePath);
  } catch (error) {
    console.error("Error storing image path in AsyncStorage", error);
  }
}

