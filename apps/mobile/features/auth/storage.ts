import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type StoredAccessToken = {
  accessToken: string;
  expiresAt: number;
  scope: string;
  tokenType: 'Bearer';
};

const ACCESS_TOKEN_STORAGE_KEY = 'expo50sdktemplate.oauth.access-token';
const EXPIRY_SAFETY_WINDOW_MS = 30_000;

let webAccessToken: StoredAccessToken | null = null;

function isStoredAccessToken(value: unknown): value is StoredAccessToken {
  if (!value || typeof value !== 'object') return false;

  const token = value as Partial<StoredAccessToken>;
  return (
    typeof token.accessToken === 'string' &&
    token.tokenType === 'Bearer' &&
    typeof token.scope === 'string' &&
    typeof token.expiresAt === 'number'
  );
}

function isExpired(token: StoredAccessToken) {
  return token.expiresAt <= Date.now() + EXPIRY_SAFETY_WINDOW_MS;
}

export async function loadAccessToken() {
  if (Platform.OS === 'web') {
    if (webAccessToken && isExpired(webAccessToken)) {
      webAccessToken = null;
    }
    return webAccessToken;
  }

  if (!(await SecureStore.isAvailableAsync())) {
    throw new Error('Secure storage is unavailable on this device.');
  }

  const serializedToken = await SecureStore.getItemAsync(
    ACCESS_TOKEN_STORAGE_KEY,
  );
  if (!serializedToken) return null;

  try {
    const parsedToken: unknown = JSON.parse(serializedToken);
    if (!isStoredAccessToken(parsedToken) || isExpired(parsedToken)) {
      await clearAccessToken();
      return null;
    }
    return parsedToken;
  } catch {
    await clearAccessToken();
    return null;
  }
}

export async function saveAccessToken(token: StoredAccessToken) {
  if (Platform.OS === 'web') {
    webAccessToken = token;
    return;
  }

  if (!(await SecureStore.isAvailableAsync())) {
    throw new Error('Secure storage is unavailable on this device.');
  }

  await SecureStore.setItemAsync(
    ACCESS_TOKEN_STORAGE_KEY,
    JSON.stringify(token),
    { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
  );
}

export async function clearAccessToken() {
  webAccessToken = null;
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY);
  }
}
