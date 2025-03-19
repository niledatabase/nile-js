import { Server } from './Server';
import { ServerConfig } from './types';

describe('server', () => {
  it('has reasonable defaults', () => {
    const config = {
      databaseId: 'databaseId',
      databaseName: 'databaseName',
      user: 'username',
      password: 'password',
      db: {
        host: 'db.thenile.dev',
      },
      api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
    };
    const server = new Server(config);
    expect(server.config.db).toEqual({
      host: 'db.thenile.dev',
      port: expect.any(Number),
      database: 'databaseName',
      user: 'username',
      password: 'password',
    });
    expect(server.config.api.basePath).toEqual(
      'http://thenile.dev/v2/databases/testdb'
    );
  });
  it('sets a tenant id everywhere when set', () => {
    const config = {
      databaseId: 'databaseId',
      user: 'username',
      password: 'password',
    };
    const nile = new Server(config);
    nile.tenantId = 'tenantId';
    nile.userId = 'userId';
    expect(nile.api.users.tenantId).toEqual('tenantId');
    expect(nile.api.tenants.tenantId).toEqual('tenantId');
  });

  it('ensures existing configs get updated with provided configs', () => {
    const config = {
      databaseId: 'databaseId',
      user: 'username',
      password: 'password',
    };
    const nile = new Server(config);

    const another = nile.getInstance({
      databaseId: 'somethingelse?!',
      tenantId: null,
      user: 'username',
      password: 'password',
    });
    expect(another.tenantId).toEqual(null);
    another.tenantId = 'something else';
    expect(another.tenantId).toEqual('something else');

    const sameOne = nile.getInstance({
      databaseId: 'somethingelse?!',
      tenantId: null,
      user: 'username',
      password: 'password',
    });
    expect(sameOne.tenantId).toEqual(null);
  });
  beforeEach(() => {
    // @ts-expect-error - test
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Reset fetch after each test
  });
  it('allows for route overriding', async () => {
    const config: ServerConfig = {
      api: {
        routePrefix: '/nile/api',
        routes: {
          ME: '/profile',
          TENANT_USERS: '/tenants/:tenantId/users',
        },
      },
    };

    const nile = new Server(config);
    const matcher = {
      CALLBACK: '/nile/api/auth/callback',
      ME: config?.api?.routes?.ME,
      TENANT_USERS: config?.api?.routes?.TENANT_USERS,
    };
    expect(nile.api.routes).toMatchObject(matcher);
    for (const [, value] of Object.entries(nile.api)) {
      if (value?.api !== undefined) {
        expect(value.api.routes).toEqual({
          ME: config?.api?.routes?.ME,
          TENANT_USERS: config?.api?.routes?.TENANT_USERS,
        });
      }
    }
    const me = await nile.api.handlers.GET(
      new Request(`http://localhost:3000${String(matcher.ME)}`)
    );
    // we are eating the fetch, but a 404 would mean the new route isn't used
    expect(me?.status).toBeUndefined();

    // routes are not configurable server side
    expect(nile.api.users.tenantUsersUrl).toEqual('/tenants/{tenantId}/users');
  });
});
