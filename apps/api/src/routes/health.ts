import type { IncomingMessage, ServerResponse } from 'node:http';

import { sendJson } from '../http/response';

export function healthRoute(
  _request: IncomingMessage,
  response: ServerResponse,
) {
  console.log('Health check requested');
  sendJson(response, 200, {
    service: 'api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
