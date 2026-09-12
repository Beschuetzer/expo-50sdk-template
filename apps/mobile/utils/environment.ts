const REQUIRED_ENV_KEYS = [
  'EXPO_PUBLIC_ENV',
  'EXPO_PUBLIC_IP_ADDRESS',
  'EXPO_PUBLIC_PORT_NUMBER',
] as const;

export type EnvironmentConfig = {
  env: string;
  ipAddress: string;
  portNumber: string;
};

export function getRequiredEnvironment(): EnvironmentConfig {
  const env = process.env.EXPO_PUBLIC_ENV?.trim();
  const ipAddress = process.env.EXPO_PUBLIC_IP_ADDRESS?.trim();
  const portNumber = process.env.EXPO_PUBLIC_PORT_NUMBER?.trim();

  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => {
    const value =
      key === 'EXPO_PUBLIC_ENV'
        ? env
        : key === 'EXPO_PUBLIC_IP_ADDRESS'
          ? ipAddress
          : portNumber;

    return !value;
  });

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Expo env values: ${missingKeys.join(', ')}. Copy .env.example to .env and fill in the required values.`,
    );
  }

  return {
    env,
    ipAddress,
    portNumber,
  } as EnvironmentConfig;
}

export function getIsDevelopmentMode() {
  return !!process.env.EXPO_PUBLIC_ENV?.match(/dev|development/i);
}

export function getEnvironmentOrDefault() {
  try {
    return getRequiredEnvironment();
  } catch {
    return {
      env: process.env.EXPO_PUBLIC_ENV || 'development',
      ipAddress: process.env.EXPO_PUBLIC_IP_ADDRESS || '127.0.0.1',
      portNumber: process.env.EXPO_PUBLIC_PORT_NUMBER || '4200',
    } satisfies EnvironmentConfig;
  }
}

