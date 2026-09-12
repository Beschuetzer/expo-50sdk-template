import {
  getEnvironmentOrDefault,
  getIsDevelopmentMode,
  getRequiredEnvironment,
} from './environment';

describe('environment helpers', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    process.env = { ...originalEnvironment };
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('reads all required Expo values', () => {
    process.env.EXPO_PUBLIC_ENV = 'development';
    process.env.EXPO_PUBLIC_IP_ADDRESS = '192.168.1.5';
    process.env.EXPO_PUBLIC_PORT_NUMBER = '4200';

    expect(getRequiredEnvironment()).toEqual({
      env: 'development',
      ipAddress: '192.168.1.5',
      portNumber: '4200',
    });
    expect(getIsDevelopmentMode()).toBe(true);
  });

  it('reports missing required values', () => {
    delete process.env.EXPO_PUBLIC_ENV;
    delete process.env.EXPO_PUBLIC_IP_ADDRESS;
    delete process.env.EXPO_PUBLIC_PORT_NUMBER;

    expect(() => getRequiredEnvironment()).toThrow(
      'Missing required Expo env values',
    );
  });

  it('falls back to local development defaults', () => {
    delete process.env.EXPO_PUBLIC_ENV;
    delete process.env.EXPO_PUBLIC_IP_ADDRESS;
    delete process.env.EXPO_PUBLIC_PORT_NUMBER;

    expect(getEnvironmentOrDefault()).toEqual({
      env: 'development',
      ipAddress: '127.0.0.1',
      portNumber: '4200',
    });
  });
});
