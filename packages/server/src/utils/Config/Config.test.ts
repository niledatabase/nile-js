import { NileConfig } from '../../types';

import { Config } from '.';

jest.mock('../Logger', () => ({
  __esModule: true,
  default: jest.fn(() => () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

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

  const serverConfig: NileConfig = {
    userId: 'user-from-config',
    tenantId: 'tenant-from-config',
    debug: true,
    databaseName: 'config-db-name',
    databaseId: 'config-db-id',
    user: 'config-user',
    password: 'config-password',
    db: {
      host: 'config-host',
      port: 9876,
    },
    callbackUrl: 'https://config-callback.com',
    routePrefix: '/auth',
    secureCookies: false,
    apiUrl: '/config/api',
    routes: { SIGNIN: '/login' },
    origin: 'https://frontend.app',
  };

  it('should prioritize config values over env vars', () => {
    const config = new Config(serverConfig);

    expect(config.db.user).toBe('config-user');
    expect(config.db.password).toBe('config-password');
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

    expect(config.callbackUrl).toBe('https://config-callback.com');
    expect(config.routePrefix).toBe('/auth');
    expect(config.secureCookies).toBe(false);
    expect(config.origin).toBe('https://frontend.app');
    expect(config.routes?.SIGNIN).toBe('/login');
    expect(config.apiUrl).toBe('/config/api');
  });

  it('should fall back to environment variables if config is missing', () => {
    const config = new Config();

    expect(config.db.user).toBe('env-user');
    expect(config.db.password).toBe('env-password');
    expect(config.tenantId).toBe(undefined);
    expect(config.userId).toBe(undefined);

    expect(config.callbackUrl).toBe('https://callback.test');
    expect(config.secureCookies).toBe(true);
    expect(config.apiUrl).toBe('https://api.test.com/base/path');
  });

  it('should throw if required env vars are missing in non-test env', () => {
    delete process.env.NILEDB_USER;
    delete process.env.NILEDB_PASSWORD;
    process.env.NODE_ENV = 'development';

    expect(() => new Config(undefined)).toThrow(/database user is required/);
  });
});
