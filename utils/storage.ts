import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

import { logWhenDevelopmentMode } from './logging';

import { EMPTY_STRING } from '@/constants/general';
import { Key } from '@/types/Task';
import { FileNames } from '@/types/general';

export async function deleteImages(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    if (!imageUrl.match(/^(file|content):/)) {
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

export async function getDirectory() {
  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) {
    throw new Error('You must allow permission to save.');
  }
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
    alert(JSON.stringify({ message: 'Error loading app state:', error }, null, 2));
  }
  return toReturn;
}

export async function pickImage(options?: ImagePicker.ImagePickerOptions) {
  try {
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

export async function retrieveImagePathFromAsyncStorage(key: Key) {
  try {
    const keyToUse = String(key);
    return await AsyncStorage.getItem(keyToUse);
  } catch (error) {
    logWhenDevelopmentMode(
      'Error retrieving image path in AsyncStorage',
      error,
    );
    return null;
  }
}

export async function saveImageLocally(key: Key, uri: string) {
  try {
    const keyToUse = String(key);
    const imagePath = `${FileSystem.documentDirectory}${keyToUse}`;
    const downloadResumable = FileSystem.createDownloadResumable(
      uri,
      imagePath,
    );
    const response = await downloadResumable.downloadAsync();
    if (response?.status && response.status <= 300) {
      await saveImagePathToAsyncStorage(key, imagePath);
      return imagePath;
    }
    logWhenDevelopmentMode(`Unable to save image ${response?.uri}`);
    return '';
  } catch (error) {
    logWhenDevelopmentMode('Error saving image locally', error);
    return '';
  }
}

export async function saveImagePathToAsyncStorage(key: Key, imagePath: string) {
  try {
    const keyToUse = String(key);
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

export function getImagePickerOptions(
  options?: ImagePicker.ImagePickerOptions,
) {
  return {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
    selectionLimit: 1,
    ...options,
  } as ImagePicker.ImagePickerOptions;
}

export async function scheduleNotification(
  request: Notifications.NotificationRequestInput,
) {
  await Notifications.scheduleNotificationAsync(request);
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
