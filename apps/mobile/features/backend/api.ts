import type { HealthResponse } from '@expo-50sdk-template/shared-types';

import { getBackendUrl } from '@/utils/helpers';

export async function getBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${getBackendUrl()}/health`);
  const result = (await response.json()) as HealthResponse;

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }

  return result;
}
