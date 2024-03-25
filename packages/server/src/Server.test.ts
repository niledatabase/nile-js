import Nile from './Server';

describe('server', () => {
  it('has reasonable defaults', () => {
    const config = {
      database: 'database',
      workspace: 'workspace',
    };
    const server = Nile(config);
    expect(server.config.db.connection).toEqual({
      host: 'db.thenile.dev',
      port: 5432,
      database: 'database',
    });
    expect(server.config.api.basePath).toEqual('https://api.thenile.dev');
  });
  it('sets a tenant id everywhere when set', () => {
    const config = {
      database: 'database',
      workspace: 'workspace',
    };
    const nile = Nile(config);
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
      database: 'database',
      workspace: 'workspace',
    };
    const nile = Nile(config);

    const another = nile.getInstance({ database: 'somethingelse?!' });
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
      database: 'database',
      workspace: 'workspace',
    };
    const nile = Nile(config);

    const another = nile.getInstance({
      database: 'somethingelse?!',
      tenantId: null,
    });
    expect(another.tenantId).toEqual(null);
    another.tenantId = 'something else';
    expect(another.tenantId).toEqual('something else');

    const sameOne = nile.getInstance({
      database: 'somethingelse?!',
      tenantId: null,
    });
    expect(sameOne.tenantId).toEqual(null);
  });
});
