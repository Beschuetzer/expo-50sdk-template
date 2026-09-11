import * as Location from 'expo-location';
import { Insets } from 'react-native';
import { v4 as uuidV4 } from 'uuid';

import { getEnvironmentOrDefault, getIsDevelopmentMode } from './environment';
import { logWhenDevelopmentMode } from './logging';

import { CurrentLocation, GpsCoordinate } from '@/types/general';

export function displayAlert(object: object | null) {
  logWhenDevelopmentMode(
    object ? JSON.stringify(object, null, 2) : object ?? 'displayAlert called',
  );
}

export function getBackendUrl() {
  const config = getEnvironmentOrDefault();

  return getIsDevelopmentMode()
    ? `http://${config.ipAddress}:${config.portNumber}`
    : 'https://your-production-api.example.com';
}

export function calculateDistance(
  gpsCoordinateStart:
    | CurrentLocation
    | { lat?: string | number | null; lon?: string | number | null }
    | undefined,
  gpsCoordinateEnd:
    | CurrentLocation
    | { lat?: string | number | null; lon?: string | number | null }
    | undefined,
) {
  const { lat: lat1, lon: lon1 } = gpsCoordinateStart || {};
  const { lat: lat2, lon: lon2 } = gpsCoordinateEnd || {};

  if (lat1 == null || lat2 == null || lon1 == null || lon2 == null) return -1;

  const lat1Value = String(lat1);
  const lon1Value = String(lon1);
  const lat2Value = String(lat2);
  const lon2Value = String(lon2);

  const radLat1 = (Math.PI * parseFloat(lat1Value)) / 180;
  const radLon1 = (Math.PI * parseFloat(lon1Value)) / 180;
  const radLat2 = (Math.PI * parseFloat(lat2Value)) / 180;
  const radLon2 = (Math.PI * parseFloat(lon2Value)) / 180;

  const deltaLat = radLat2 - radLat1;
  const deltaLon = radLon2 - radLon1;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const radius = 6371;
  const distance = radius * c;

  return Math.round(distance * 100) / 100;
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

export async function measureExecutionTime(
  func: () => Promise<void>,
  key = 'Func',
  shouldLog = true,
) {
  const start = performance.now();
  func && (await func());
  const end = performance.now();
  if (shouldLog) {
    logWhenDevelopmentMode({ [`executionTimeOf${key}`]: end - start });
  }
}

export function getButtonHitSlop(multiplier = 1) {
  return {
    top: 10 * multiplier,
    bottom: 10 * multiplier,
    left: 10 * multiplier,
    right: 10 * multiplier,
  } as Insets;
}

export function wait(ms: number) {
  if (ms <= 0) return;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
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

export function getId() {
  return uuidV4();
}

export function getEmptyArray<T>() {
  return [] as T;
}

export function getEmptyObject<T>() {
  return {} as T;
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
