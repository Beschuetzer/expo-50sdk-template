import { Key } from "@/types/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export async function delay(ms: number) {
  if (ms <= 0) return;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
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

export function getKeyToUse(key: Key) {
  const toReturn = key?.upc || key?.name || "";

  if (!toReturn) {
    alert(
      "No key given.  Please delete the item in question and ensure there is either a upc or name given."
    );
    return toReturn;
  }

  return toReturn;
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
      imagePath
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
    console.log("Image path stored in AsyncStorage");
  } catch (error) {
    console.error("Error storing image path in AsyncStorage", error);
  }
}
