export type HealthStatus = 'ok' | 'error';

export type HealthResponse = {
  service: string;
  status: HealthStatus;
  timestamp?: string;
};
