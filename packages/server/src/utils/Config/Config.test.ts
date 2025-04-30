import { ServerConfig } from '../../types';

import { Config, ApiConfig } from '.';

describe('Config', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }; // clone
    process.env.NODE_ENV = 'development';

    process.env.NILEDB_USER = 'env-user';
    process.env.NILEDB_PASSWORD = 'env-password';
    process.env.NILEDB_NAME = 'env-db-name';
    process.env.NILEDB_ID = 'env-db-id';
    process.env.NILEDB_TENANT = 'env-tenant-id';
    process.env.NILEDB_TOKEN = 'env-token';
    process.env.NILEDB_CALLBACK_URL = 'https://callback.test';
    process.env.NILEDB_COOKIE_KEY = 'cookie-key-env';
    process.env.NILEDB_SECURECOOKIES = 'true';
    process.env.NILEDB_API_URL = 'https://api.test.com/base/path';
    process.env.NILEDB_HOST = 'env-host';
    process.env.NILEDB_PORT = '6543';
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  const serverConfig: ServerConfig = {
    userId: 'user-from-config',
    tenantId: 'tenant-from-config',
    logger: { info: jest.fn() },
    debug: true,
    databaseName: 'config-db-name',
    databaseId: 'config-db-id',
    user: 'config-user',
    password: 'config-password',
    db: {
      host: 'config-host',
      port: 9876,
    },
    api: {
      token: 'config-token',
      cookieKey: 'config-cookie',
      callbackUrl: 'https://config-callback.com',
      routePrefix: '/auth',
      secureCookies: false,
      basePath: '/config/api',
      routes: { SIGNIN: '/login' },
      origin: 'https://frontend.app',
    },
  };

  fit('should prioritize config values over env vars', () => {
    const config = new Config(serverConfig);

    expect(config.user).toBe('config-user');
    expect(config.password).toBe('config-password');
    expect(config.databaseName).toBe('config-db-name');
    expect(config.databaseId).toBe('config-db-id');
    expect(config.tenantId).toBe('tenant-from-config'); // config wins
    expect(config.userId).toBe('user-from-config');
    expect(config.debug).toBe(true);

    expect(config.db).toEqual(
      expect.objectContaining({
        user: 'config-user',
        password: 'config-password',
        host: 'config-host',
        port: 9876,
        database: 'config-db-name',
      })
    );

    expect(config.api).toBeInstanceOf(ApiConfig);
    expect(config.api.token).toBe('config-token');
    expect(config.api.cookieKey).toBe('config-cookie');
    expect(config.api.callbackUrl).toBe('https://config-callback.com');
    expect(config.api.routePrefix).toBe('/auth');
    expect(config.api.secureCookies).toBe(false);
    expect(config.api.origin).toBe('https://frontend.app');
    expect(config.api.routes?.SIGNIN).toBe('/login');
    expect(config.api.basePath).toBe('/config/api');
  });

  it('should fall back to environment variables if config is missing', () => {
    const config = new Config(undefined, 'fallback-test');

    expect(config.user).toBe('env-user');
    expect(config.password).toBe('env-password');
    expect(config.databaseName).toBe('env-db-name');
    expect(config.databaseId).toBe('env-db-id');
    expect(config.tenantId).toBe('env-tenant-id');
    expect(config.userId).toBe(undefined);

    expect(config.api.token).toBe('env-token');
    expect(config.api.cookieKey).toBe('cookie-key-env');
    expect(config.api.callbackUrl).toBe('https://callback.test');
    expect(config.api.secureCookies).toBe(true);
    expect(config.api.basePath).toBe('https://api.test.com/base/path');
  });

  it('should throw if required env vars are missing in non-test env', () => {
    delete process.env.NILEDB_USER;
    delete process.env.NILEDB_PASSWORD;
    process.env.NODE_ENV = 'development';

    expect(() => new Config(undefined)).toThrow(/User is required/);
  });

  it('should not throw if missing user/password in TEST env', () => {
    delete process.env.NILEDB_USER;
    delete process.env.NILEDB_PASSWORD;
    process.env.NODE_ENV = 'TEST';

    expect(() => new Config(undefined)).not.toThrow();
  });
});
