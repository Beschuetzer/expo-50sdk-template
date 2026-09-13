import { loadConfig } from './config/env';
import {
  createIdentityProviderServer,
  startIdentityProviderServer,
  stopIdentityProviderServer,
} from './server';

const config = loadConfig();

function main() {
  return createIdentityProviderServer(config).then((server) =>
    startIdentityProviderServer(server, config).then(() => {
      function shutdown(signal: string) {
        console.log(`Received ${signal}; shutting down identity provider`);
        stopIdentityProviderServer(server)
          .then(() => process.exit(0))
          .catch((error: unknown) => {
            console.error(
              'Failed to shut down identity provider cleanly',
              error,
            );
            process.exit(1);
          });
      }

      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    }),
  );
}

main().catch((error: unknown) => {
  console.error('Failed to start identity provider', error);
  process.exitCode = 1;
});
