import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'

import {
  EMPTY_STRING,
  IMAGE_PICKER_OPTIONS,
  IMAGE_PRIORITY_MAPPING,
} from '@/constants/general'
import { Key, SortedList } from '@/types/Item'
import { GpsCoordinate } from '@/types/Store'
import { UpcProduct } from '@/types/UpcResponse'
import { SortType } from '@/components/lists/sorters'

export function calculateDistance(
  gpsCoordinateStart: GpsCoordinate | null | undefined,
  gpsCoordinateEnd: GpsCoordinate | null | undefined,
) {
  const { lat: lat1, lon: lon1 } = gpsCoordinateStart || {}
  const { lat: lat2, lon: lon2 } = gpsCoordinateEnd || {}

  if (lat1 == null || lat2 == null || lon1 == null || lon2 == null) return -1

  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * parseFloat(lat1)) / 180
  const radLon1 = (Math.PI * parseFloat(lon1)) / 180
  const radLat2 = (Math.PI * parseFloat(lat2)) / 180
  const radLon2 = (Math.PI * parseFloat(lon2)) / 180

  // Calculate the differences between coordinates
  const deltaLat = radLat2 - radLat1
  const deltaLon = radLon2 - radLon1

  // Haversine formula to calculate distance
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Earth's radius in kilometers (you can use 3959 for miles)
  const radius = 6371

  // Calculate the distance
  const distance = radius * c

  return Math.round(distance * 100) / 100
}

export async function delay(ms: number) {
  if (ms <= 0) return
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, ms)
  })
}

export async function deleteFile(path: string) {
  if (!path) return
  try {
    console.log(`deleting '${path}'...`)
    await FileSystem.deleteAsync(path)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export function displayAlert(object: object | null) {
  alert(object ? JSON.stringify(object, null, 2) : object)
}

export function getEmptyArray<T>() {
  return [] as T
}

export function getEmptyObject<T>() {
  return {} as T
}

export function getEmptyList<T>(): SortedList<T> {
  return {
    currentSortType: SortType.None,
    [SortType.None]: [],
  }
}

export function getKeyToUse(key: Key, displayAlert = true) {
  const toReturn = key?.upc || key?.name || EMPTY_STRING

  if (!toReturn && displayAlert) {
    alert(
      'No key given.  Please delete the item in question and ensure there is either a upc or name given.',
    )
  }

  return toReturn
}

export async function getGpsCoordinate(): Promise<GpsCoordinate> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied')
  }
  const location = await Location.getCurrentPositionAsync({})
  if (!location?.coords) {
    return {
      lat: '-1',
      lon: '-1',
    }
  }
  return {
    lat: location.coords.latitude.toString(),
    lon: location.coords.longitude.toString(),
  }
}

export function getImagesFromUpcProduct(upcProduct: UpcProduct) {
  return Object.values(IMAGE_PRIORITY_MAPPING).map(
    (key) => upcProduct?.[key] || EMPTY_STRING,
  )
}

export async function captureImage() {
  try {
    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS)

    if (!result.canceled) {
      return result.assets[0].uri
    }
  } catch (error) {
    console.log({ error })
  }
}

export async function pickImage() {
  try {
    // No permissions request is necessary for launching the image library
    const result =
      await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS)

    if (!result.canceled) {
      return result.assets[0].uri
    }
  } catch (error) {
    console.log({ error })
  }
}

export async function retrieveImagePathFromAsyncStorage(key: Key) {
  try {
    const keyToUse = getKeyToUse(key)
    return await AsyncStorage.getItem(keyToUse)
  } catch (error) {
    console.log('Error retrieving image path in AsyncStorage', error)
    return null
  }
}

/**
 *@param key the key to use
 *@param uri the link to the image (web)
 **/
export async function saveImageLocally(key: Key, uri: string) {
  try {
    const keyToUse = getKeyToUse(key)
    const imagePath = `${FileSystem.documentDirectory}${keyToUse}`
    const downloadResumable = FileSystem.createDownloadResumable(uri, imagePath)
    const response = await downloadResumable.downloadAsync()
    if (response?.status && response.status <= 300) {
      await saveImagePathToAsyncStorage(key, imagePath)
      return imagePath
    } else {
      console.log(`Unable to save image ${response?.uri}`)
      return ''
    }
  } catch (error) {
    console.log('Error saving image locally', error)
    return ''
  }
}

export async function saveImagePathToAsyncStorage(key: Key, imagePath: string) {
  try {
    const keyToUse = getKeyToUse(key)
    await AsyncStorage.setItem(keyToUse, imagePath)
  } catch (error) {
    console.log('Error storing image path in AsyncStorage', error)
  }
}
