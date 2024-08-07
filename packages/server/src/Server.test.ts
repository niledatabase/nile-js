import { Server } from './Server';

describe('server', () => {
  fit('has reasonable defaults', () => {
    const config = {
      databaseId: 'databaseId',
      databaseName: 'databaseName',
      user: 'username',
      password: 'password',
    };
    const server = new Server(config);
    expect(server.config.db).toEqual({
      host: 'db.thenile.dev',
      port: 5432,
      database: 'databaseName',
      user: 'username',
      password: 'password',
    });
    expect(server.config.api.basePath).toEqual('https://api.thenile.dev');
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
    for (const api in nile.api) {
      // @ts-expect-error - checking api
      const _api = nile.api[api];
      expect(_api.tenantId).toEqual('tenantId');
    }
  });
  it('manages instances', () => {
    const config = {
      databaseId: 'databaseId',
      user: 'username',
      password: 'password',
    };
    const nile = new Server(config);

    const another = nile.getInstance({
      databaseId: 'somethingelse?!',
      user: 'username',
      password: 'password',
    });
    const theSameOne = nile.getInstance(config);

    // in this case, we change the base object tenant id
    theSameOne.tenantId = 'tenantId2';
    expect(nile.config.tenantId).toEqual('tenantId2');

    nile.tenantId = 'tenantId4';
    another.tenantId = 'tenantId1';

    expect(nile.config).not.toEqual(another?.config);
    expect(nile.config).toEqual(theSameOne?.config);

    //@ts-expect-error - test
    expect(nile.servers.size).toEqual(1);
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
});
