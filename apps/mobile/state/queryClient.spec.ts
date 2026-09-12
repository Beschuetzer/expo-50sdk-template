import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearPersistedQueryCache,
  queryClient,
  queryPersistOptions,
} from './queryClient';

describe('query persistence policy', () => {
  afterEach(async () => {
    queryClient.clear();
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('persists only successful backend health data', () => {
    const shouldDehydrateQuery =
      queryPersistOptions.dehydrateOptions.shouldDehydrateQuery;

    expect(
      shouldDehydrateQuery({
        queryKey: ['backend', 'health'],
        state: { status: 'success' },
      }),
    ).toBe(true);
    expect(
      shouldDehydrateQuery({
        queryKey: ['account', 'profile'],
        state: { status: 'success' },
      }),
    ).toBe(false);
    expect(
      shouldDehydrateQuery({
        queryKey: ['backend', 'health'],
        state: { status: 'error' },
      }),
    ).toBe(false);
  });

  it('clears memory and persisted query data', async () => {
    queryClient.setQueryData(['account', 'profile'], { subject: 'user-1' });
    const removeClient = jest
      .spyOn(queryPersistOptions.persister, 'removeClient')
      .mockResolvedValue(undefined);

    await clearPersistedQueryCache();

    expect(queryClient.getQueryData(['account', 'profile'])).toBeUndefined();
    expect(removeClient).toHaveBeenCalledTimes(1);
  });
});
