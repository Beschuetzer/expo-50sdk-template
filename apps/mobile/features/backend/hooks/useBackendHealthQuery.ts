import { useQuery } from '@tanstack/react-query';

import { getBackendHealth } from '../api';

export const backendHealthQueryKey = ['backend', 'health'] as const;

export function useBackendHealthQuery() {
  return useQuery({
    enabled: false,
    queryFn: getBackendHealth,
    queryKey: backendHealthQueryKey,
    retry: false,
    staleTime: 1000 * 30,
  });
}
