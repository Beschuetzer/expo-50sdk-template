export interface IdentityProviderConfig {
  environment: string;
  host: string;
  port: number;
  issuer: string;
  signingKeySecret: string;
  accessTokenLifetimeSeconds: number;
  authorizationCodeLifetimeSeconds: number;
}

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 4300;
const DEFAULT_ISSUER = 'http://localhost:4300';
const DEFAULT_ACCESS_TOKEN_LIFETIME = 900;
const DEFAULT_AUTHORIZATION_CODE_LIFETIME = 300;

function parsePort(value: string | undefined) {
  if (!value?.trim()) return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('IDP_PORT must be an integer between 1 and 65535');
  }
  return port;
}

function parsePositiveInteger(value: string | undefined, name: string, fallback: number) {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): IdentityProviderConfig {
  const issuer = environment.IDP_ISSUER?.trim() || DEFAULT_ISSUER;
  return {
    environment: environment.NODE_ENV ?? 'development',
    host: environment.IDP_HOST?.trim() || DEFAULT_HOST,
    port: parsePort(environment.IDP_PORT),
    issuer: issuer.replace(/\/$/, ''),
    signingKeySecret: environment.IDP_SIGNING_KEY_SECRET?.trim() || 'local-development-signing-secret-change-me',
    accessTokenLifetimeSeconds: parsePositiveInteger(
      environment.IDP_ACCESS_TOKEN_LIFETIME,
      'IDP_ACCESS_TOKEN_LIFETIME',
      DEFAULT_ACCESS_TOKEN_LIFETIME,
    ),
    authorizationCodeLifetimeSeconds: parsePositiveInteger(
      environment.IDP_AUTHORIZATION_CODE_LIFETIME,
      'IDP_AUTHORIZATION_CODE_LIFETIME',
      DEFAULT_AUTHORIZATION_CODE_LIFETIME,
    ),
  };
}
