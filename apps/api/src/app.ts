import type { IncomingMessage, ServerResponse } from 'node:http';

import { sendJson } from './http/response';
import { healthRoute } from './routes/health';

function getPath(request: IncomingMessage) {
  return new URL(request.url ?? '/', 'http://localhost').pathname;
}

export function createApp() {
  return (request: IncomingMessage, response: ServerResponse) => {
    const path = getPath(request);

    if (request.method === 'GET' && path === '/health') {
      healthRoute(request, response);
      return;
    }

    sendJson(response, 404, {
      message: 'Try GET /health',
      status: 'not_found',
    });
  };
}
