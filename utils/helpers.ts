import { Key } from "@/types/Item";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function delay(ms: number) {
    if (ms <= 0) return;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, ms)
    })
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
    alert('No key given.  Please delete the item in question and ensure there is either a upc or name given.')
    return toReturn;
  }

  return toReturn;
}


export async function saveImageLocally(key: Key, uri: string) {
  const keyToUse = getKeyToUse(key);
  try {
    alert('need to implement with expo package')
  } catch (error) {
    console.error("Error saving image locally", error);
    return null;
  }
};

export async function saveImagePathToAsyncStorage (key: Key, imagePath: string) {
  try {
    const keyToUse = getKeyToUse(key);
    await AsyncStorage.setItem(keyToUse, imagePath);
    console.log("Image path stored in AsyncStorage");
  } catch (error) {
    console.error("Error storing image path in AsyncStorage", error);
  }
};
