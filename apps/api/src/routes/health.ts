import type { Request, Response } from 'express';

import type { HealthResponse } from '@expo-50sdk-template/shared-types';

export function healthRoute(_request: Request, response: Response) {
  console.log('Health check requested');
  const healthResponse: HealthResponse = {
    service: 'api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
  response.status(200).json(healthResponse);
}
