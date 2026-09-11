import { loadConfig } from './config/env';
import { createApiServer, startApiServer, stopApiServer } from './server';

const config = loadConfig();
const server = startApiServer(createApiServer(), config);

function shutdown(signal: string) {
  console.log(`Received ${signal}; shutting down API`);
  stopApiServer(server)
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error('Failed to shut down API cleanly', error);
      process.exit(1);
    });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
