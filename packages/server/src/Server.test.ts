import { NileConfig } from './types';
import { getTenantId } from './utils/Config/envVars';
import { handlersWithContext } from './api/handlers/withContext';
import DbManager from './db';
import Users from './users';
import Tenants from './tenants';
import Auth from './auth';
import { watchHeaders, watchTenantId, watchUserId } from './utils/Event';
import { Server, create } from './Server';
import { Config } from './utils/Config';

// Mocks

jest.mock('./utils/Logger', () => {
  const mockWarn = jest.fn();
  const mockDebug = jest.fn();

  return () => () => ({
    warn: mockWarn,
    debug: mockDebug,
    silly: jest.fn(),
  });
});

jest.mock('./db');
jest.mock('./users');
jest.mock('./tenants');
jest.mock('./auth');
jest.mock('./utils/Event', () => ({
  watchHeaders: jest.fn((cb) => cb(new Headers({ 'x-test': 'test' }))),
  watchUserId: jest.fn((cb) => cb('mock-user')),
  watchTenantId: jest.fn((cb) => cb('mock-tenant')),
}));
jest.mock('./utils/Config/envVars', () => ({
  getTenantId: jest.fn(() => 'env-tenant-id'),
  getSecureCookies: jest.fn(() => 'env-secure-cookies'),
  getCallbackUrl: jest.fn(() => 'env-callback-url'),
  getApiUrl: jest.fn(() => 'env-api-url'),
  getUsername: jest.fn(() => 'env-username'),
  getPassword: jest.fn(() => 'env-password'),
  getDatabaseName: jest.fn(() => 'env-database-name'),
  getDbHost: jest.fn(() => 'env-db-host'),
  getDbPort: jest.fn(() => 'env-db-port'),
}));
const mockPool = {
  query: jest.fn(),
  end: jest.fn(),
};

const mockClear = jest.fn();
(DbManager as jest.Mock).mockImplementation(() => ({
  getConnection: () => mockPool,
  clear: mockClear,
}));

describe('Server', () => {
  let config: NileConfig;
  let server: Server;

  beforeEach(() => {
    jest.clearAllMocks();

    config = {
      origin: 'http://localhost',
      secureCookies: true,
      headers: {
        'x-custom': 'value',
      },
    };

    server = new Server(config);
  });

  it('should instantiate with initial config', () => {
    expect(server).toBeInstanceOf(Server);
    expect(getTenantId).toHaveBeenCalled();
    expect(Users).toHaveBeenCalled();
    expect(Tenants).toHaveBeenCalled();
    expect(Auth).toHaveBeenCalled();
  });

  it('should call watchers and react to changes', () => {
    // Check that re-instantiation happens
    expect(watchTenantId).toHaveBeenCalled();
    expect(watchUserId).toHaveBeenCalled();
    expect(watchHeaders).toHaveBeenCalled();
    // Should trigger resets and reinitializations
    expect(Users).toHaveBeenCalledTimes(4);
  });

  it('should provide database access and clear method', () => {
    const db = server.db;
    expect(db.query).toBeDefined();
    expect(typeof db.clearConnections).toBe('function');
    db.clearConnections();
    expect(mockClear).toHaveBeenCalled();
  });

  it('should return configured paths', () => {
    const { paths } = server;
    expect(typeof paths).toBe('object');
  });

  it('should return handlers with context', () => {
    const handlers = server.handlers;
    expect(Object.keys(handlers.withContext)).toEqual(
      Object.keys(handlersWithContext(new Config({})))
    );
  });

  it('should return updated context with setContext (Headers)', async () => {
    const newHeaders = new Headers({ tenantid: '123', userid: 'abc' });
    const updated = await server.withContext({ headers: newHeaders });
    const context = updated.getContext();
    expect(context?.headers?.get('tenantid')).toBe('123');
  });

  it('should return updated context with setContext (Request)', async () => {
    const request = new Request('http://localhost', {
      headers: { tenantid: '789' },
    });
    const updated = await server.withContext({ headers: request.headers });
    const context = updated.getContext();
    expect(context.headers?.get('tenantid')).toBe('789');
  });

  it('should support object-style context setting', async () => {
    const updated = await server.withContext({
      tenantId: 'override-tenant',
      userId: 'override-user',
    });
    const context = updated.getContext();
    expect(context.tenantId).toBe('override-tenant');
    expect(context.userId).toBe('override-user');
  });

  it('getInstance() should mutate and reset instance correctly', async () => {
    const inst = await server.withContext({
      tenantId: 'next-tenant',
      userId: 'next-user',
      headers: new Headers({ 'x-next': 'yes' }),
    });
    const context = inst.getContext();
    expect(context.tenantId).toBe('next-tenant');
    expect(context.userId).toBe('next-user');
    expect(context.headers?.get('x-next')).toBe('yes');
  });

  it('create() should be a singleton', () => {
    const first = create();
    const second = create();
    expect(first).toBe(second);
  });
});
