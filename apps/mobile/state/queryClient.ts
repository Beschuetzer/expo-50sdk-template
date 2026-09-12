import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      networkMode: 'offlineFirst',
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 1000 * 60,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  key: '@mobile/query-cache',
  storage: AsyncStorage,
  throttleTime: 1000,
});

export const queryPersistOptions = {
  buster: 'mobile-query-cache-v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query: {
      queryKey: readonly unknown[];
      state: { status: string };
    }) =>
      query.state.status === 'success' &&
      query.queryKey.length === 2 &&
      query.queryKey[0] === 'backend' &&
      query.queryKey[1] === 'health',
  },
  maxAge: 1000 * 60 * 60 * 24,
  persister: queryPersister,
};

export async function clearPersistedQueryCache() {
  queryClient.clear();
  await queryPersister.removeClient();
}
