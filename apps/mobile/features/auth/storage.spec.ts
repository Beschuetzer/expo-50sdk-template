import * as SecureStore from 'expo-secure-store';

import {
  clearAccessToken,
  loadAccessToken,
  saveAccessToken,
  type StoredAccessToken,
} from './storage';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('access-token storage', () => {
  const token: StoredAccessToken = {
    accessToken: 'access-token',
    expiresAt: Date.now() + 60_000,
    scope: 'api:read',
    tokenType: 'Bearer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(require('react-native'), 'Platform', {
      configurable: true,
      value: { OS: 'android' },
    });
    jest.mocked(SecureStore.isAvailableAsync).mockResolvedValue(true);
  });

  it('saves and loads a valid native token', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(
      JSON.stringify(token),
    );

    await saveAccessToken(token);
    await expect(loadAccessToken()).resolves.toEqual(token);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'expo50sdktemplate.oauth.access-token',
      JSON.stringify(token),
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('clears expired tokens', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(
      JSON.stringify({ ...token, expiresAt: Date.now() - 1 }),
    );

    await expect(loadAccessToken()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'expo50sdktemplate.oauth.access-token',
    );
  });

  it('clears malformed tokens', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('{not-json');

    await expect(loadAccessToken()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it('returns null for expired web tokens and clears them', async () => {
    Object.defineProperty(require('react-native'), 'Platform', {
      configurable: true,
      value: { OS: 'web' },
    });

    const expiredToken: StoredAccessToken = {
      ...token,
      expiresAt: Date.now() - 1,
    };

    await saveAccessToken(expiredToken);
    await expect(loadAccessToken()).resolves.toBeNull();
    await expect(clearAccessToken()).resolves.toBeUndefined();
  });

  it('stores and clears web access tokens without secure storage', async () => {
    Object.defineProperty(require('react-native'), 'Platform', {
      configurable: true,
      value: { OS: 'web' },
    });

    await saveAccessToken(token);
    await expect(loadAccessToken()).resolves.toEqual(token);
    await clearAccessToken();
    await expect(loadAccessToken()).resolves.toBeNull();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('fails when secure storage is unavailable', async () => {
    jest.mocked(SecureStore.isAvailableAsync).mockResolvedValue(false);

    await expect(loadAccessToken()).rejects.toThrow(
      'Secure storage is unavailable on this device.',
    );
    await expect(saveAccessToken(token)).rejects.toThrow(
      'Secure storage is unavailable on this device.',
    );
  });
});
