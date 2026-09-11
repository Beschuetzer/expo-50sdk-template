import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { test } from 'node:test';
import { promisify } from 'node:util';

import { createApp } from './app';
import { loadConfig } from './config/env';

const listen = promisify(
  (server: ReturnType<typeof createServer>, callback: () => void) =>
    server.listen(0, '127.0.0.1', callback),
);

function get(server: ReturnType<typeof createServer>, path: string) {
  const address = server.address();
  assert(address && typeof address !== 'string');

  return new Promise<{ body: Record<string, string>; statusCode: number }>(
    (resolve, reject) => {
      const response = request(
        {
          hostname: '127.0.0.1',
          path,
          port: address.port,
        },
        (incomingResponse) => {
          let body = '';
          incomingResponse.setEncoding('utf8');
          incomingResponse.on('data', (chunk) => (body += chunk));
          incomingResponse.on('end', () => {
            resolve({
              body: JSON.parse(body) as Record<string, string>,
              statusCode: incomingResponse.statusCode ?? 0,
            });
          });
        },
      );
      response.on('error', reject);
      response.end();
    },
  );
}

test('GET /health returns an API health response', async (t) => {
  const server = createServer(createApp());
  await listen(server);
  t.after(() => server.close());

  const response = await get(server, '/health?verbose=true');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'api');
  assert.ok(response.body.timestamp);
});

test('unknown routes return a not found response', async (t) => {
  const server = createServer(createApp());
  await listen(server);
  t.after(() => server.close());

  const response = await get(server, '/unknown');

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.status, 'not_found');
});

test('configuration uses defaults and validates the port', () => {
  assert.deepEqual(loadConfig({}), {
    environment: 'development',
    host: '0.0.0.0',
    port: 4200,
  });
  assert.throws(
    () => loadConfig({ PORT: 'invalid' }),
    /PORT must be an integer/,
  );
});
