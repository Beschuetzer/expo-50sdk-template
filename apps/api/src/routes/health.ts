import type { IncomingMessage, ServerResponse } from 'node:http';

import type { HealthResponse } from '@expo-50sdk-template/shared-types';

import { sendJson } from '../http/response';

export function healthRoute(
  _request: IncomingMessage,
  response: ServerResponse,
) {
  console.log('Health check requested');
  const healthResponse: HealthResponse = {
    service: 'api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
  sendJson(response, 200, healthResponse);
}
