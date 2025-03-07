import { Server } from './Server';

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
});
