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
  it('sets a tenant id everywhere when set', async () => {
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

    // @ts-expect-error - checking db
    expect(nile._db.tenantId).toEqual('tenantId');
    // @ts-expect-error - checking db
    expect(nile._db.userId).toEqual('userId');
  });
});
