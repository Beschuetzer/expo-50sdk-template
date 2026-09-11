import { getBackendUrl } from '@/utils/helpers';

export type BackendHealth = {
  service?: string;
  status?: string;
  timestamp?: string;
};

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${getBackendUrl()}/health`);
  const result = (await response.json()) as BackendHealth;

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }

  return result;
}
