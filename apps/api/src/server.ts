import { createServer, type Server } from 'node:http';

import { createApp } from './app';
import { loadConfig, type ApiConfig } from './config/env';

export function createApiServer(config: ApiConfig = loadConfig()) {
  const server = createServer(createApp(config));

  server.on('error', (error) => {
    console.error('API server error', error);
  });

  return server;
}

export function startApiServer(server: Server, config: ApiConfig) {
  server.listen(config.port, config.host, () => {
    console.log(
      `API listening on http://${config.host}:${config.port} (${config.environment})`,
    );
  });

  return server;
}

export function stopApiServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
