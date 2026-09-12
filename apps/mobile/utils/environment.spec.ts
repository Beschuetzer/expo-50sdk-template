import {
  getEnvironmentOrDefault,
  getIsDevelopmentMode,
  getRequiredEnvironment,
} from './environment';

describe('environment helpers', () => {
  it('reads all required Expo values', () => {
    const env = {
      EXPO_PUBLIC_ENV: 'development',
      EXPO_PUBLIC_IP_ADDRESS: '192.168.1.5',
      EXPO_PUBLIC_PORT_NUMBER: '4200',
    } as NodeJS.ProcessEnv;

    expect(getRequiredEnvironment(env)).toEqual({
      env: 'development',
      ipAddress: '192.168.1.5',
      portNumber: '4200',
    });
    expect(getIsDevelopmentMode(env)).toBe(true);
  });

  it('reports missing required values', () => {
    expect(() => getRequiredEnvironment({})).toThrow(
      'Missing required Expo env values',
    );
  });

  it('falls back to local development defaults', () => {
    expect(getEnvironmentOrDefault({})).toEqual({
      env: 'development',
      ipAddress: '127.0.0.1',
      portNumber: '4200',
    });
  });

  it('fails fast for incomplete non-development configuration', () => {
    expect(() =>
      getEnvironmentOrDefault({ EXPO_PUBLIC_ENV: 'production' }),
    ).toThrow('Missing required Expo env values');
  });
});
