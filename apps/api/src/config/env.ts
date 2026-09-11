export interface ApiConfig {
  environment: string;
  host: string;
  port: number;
}

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 4200;

function parsePort(value: string | undefined) {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfig {
  return {
    environment: environment.NODE_ENV ?? 'development',
    host: environment.HOST?.trim() || DEFAULT_HOST,
    port: parsePort(environment.PORT),
  };
}
