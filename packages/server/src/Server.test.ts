import { Server } from './Server';
import { ServerConfig } from './types';
import { X_NILE_ORIGIN } from './utils/constants';

describe('server', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('has reasonable defaults', () => {
    const config = {
      databaseId: 'databaseId',
      databaseName: 'databaseName',
      user: 'username',
      password: 'password',
      db: {
        host: 'db.thenile.dev',
      },
      apiUrl: 'http://thenile.dev/v2/databases/testdb',
    };
    const server = new Server(config);
    expect(server.config.db).toEqual({
      host: 'db.thenile.dev',
      port: expect.any(Number),
      database: 'databaseName',
      user: 'username',
      password: 'password',
    });
    expect(server.config.apiUrl).toEqual(
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
    expect(nile.users.tenantId).toEqual('tenantId');
    expect(nile.tenants.tenantId).toEqual('tenantId');
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

  it('allows for route overriding', async () => {
    const config: ServerConfig = {
      routePrefix: '/nile/api',
      routes: {
        ME: '/profile',
        TENANT_USERS: '/tenants/:tenantId/users',
      },
    };

    const nile = new Server(config);
    const matcher = {
      CALLBACK: '/nile/api/auth/callback',
      ME: config?.routes?.ME,
      TENANT_USERS: config?.routes?.TENANT_USERS,
    };
    expect(nile.routes).toMatchObject(matcher);
    for (const [, value] of Object.entries(nile)) {
      if (value !== undefined) {
        expect(value.routes).toEqual({
          ME: config?.routes?.ME,
          TENANT_USERS: config?.routes?.TENANT_USERS,
        });
      }
    }
    const me = await nile.handlers.GET(
      new Request(`http://localhost:3000${String(matcher.ME)}`)
    );
    // we are eating the fetch, but a 404 would mean the new route isn't used
    expect(me?.status).toBeUndefined();

    // routes are not configurable server side
    expect(nile.users.tenantUsersUrl).toEqual('/tenants/{tenantId}/users');
  });
  it('merges headers', () => {
    const nile = new Server();
    expect(nile.headers).toEqual(undefined);
    nile.headers = {
      cookie: '123',
      [X_NILE_ORIGIN]: 'http://localhost:3000',
    };
    let update: [string, string][] = [];
    nile.headers?.forEach((value, key) => {
      update.push([key.toLowerCase(), value]);
    });
    expect(update).toEqual([
      ['cookie', '123'],
      [X_NILE_ORIGIN, 'http://localhost:3000'],
    ]);
    update = [];
    nile.headers = { host: 'localhost:3000' };
    nile.headers?.forEach((value, key) => {
      update.push([key.toLowerCase(), value]);
    });
    expect(update).toEqual([
      ['host', 'localhost:3000'],
      [X_NILE_ORIGIN, 'http://localhost:3000'],
    ]);
  });
  it('allows api set context to be an object', () => {
    const nile = new Server();
    const obj = { cookie: 'nile.session-token=123' };
    nile.setContext(obj);
    expect(nile.headers).toEqual(new Headers(obj));
  });

  it('removes the cookie if its missing', () => {
    const nile = new Server();
    nile.setContext({ cookie: 'nile.session-token=123' });
    const obj = {
      host: 'localhost:3000',
      'user-agent': 'curl/8.4.0',
      accept: '*/*',
    };
    nile.setContext(obj);
    expect(nile.headers).toEqual(new Headers(obj));
  });
});
