import { createServer, type Server } from 'node:http';

import type { IdentityProviderConfig } from './config/env';
import { createApp } from './app';
import { createDevelopmentStores } from './infrastructure/memory';
import { TokenService } from './security/tokens';

export async function createIdentityProviderServer(config: IdentityProviderConfig) {
  const app = createApp(config, createDevelopmentStores(), new TokenService(config));
  return createServer(app);
}

export async function startIdentityProviderServer(
  server: Server,
  config: IdentityProviderConfig,
) {
  await new Promise<void>((resolve) => {
    server.listen(config.port, config.host, resolve);
  });
  console.log(
    `Identity provider listening on http://${config.host}:${config.port} (${config.environment})`,
  );
  return server;
}

export function stopIdentityProviderServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
