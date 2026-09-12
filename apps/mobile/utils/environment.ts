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

export function getRequiredEnvironment(
  envVars: NodeJS.ProcessEnv = process.env,
): EnvironmentConfig {
  const env = envVars.EXPO_PUBLIC_ENV?.trim();
  const ipAddress = envVars.EXPO_PUBLIC_IP_ADDRESS?.trim();
  const portNumber = envVars.EXPO_PUBLIC_PORT_NUMBER?.trim();

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

export function getIsDevelopmentMode(envVars: NodeJS.ProcessEnv = process.env) {
  return !!envVars.EXPO_PUBLIC_ENV?.match(/dev|development/i);
}

export function getEnvironmentOrDefault(
  envVars: NodeJS.ProcessEnv = process.env,
) {
  try {
    return getRequiredEnvironment(envVars);
  } catch (error) {
    const configuredEnvironment = envVars.EXPO_PUBLIC_ENV?.trim();
    if (configuredEnvironment && !/dev|development/i.test(configuredEnvironment)) {
      throw error;
    }

    return {
      env: envVars.EXPO_PUBLIC_ENV || 'development',
      ipAddress: envVars.EXPO_PUBLIC_IP_ADDRESS || '127.0.0.1',
      portNumber: envVars.EXPO_PUBLIC_PORT_NUMBER || '4200',
    } satisfies EnvironmentConfig;
  }
}

