import type { ServerResponse } from 'node:http';

export function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
) {
  const payload = JSON.stringify(body);

  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'content-length': Buffer.byteLength(payload),
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(payload);
}
