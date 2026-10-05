import pg from 'pg';

import { Config } from '../utils/Config';

import NileDB from './index';

describe('db', () => {
  it('rejects changes to the callback authentication scope before reusing a pool', () => {
    const config = new Config({
      apiUrl: 'http://localhost/api',
      databaseId: 'databaseId',
      databaseName: 'databaseName',
      user: 'username',
      password: async () => 'token',
      debug: false,
      db: {
        port: 4433,
      },
      tenantId: null,
      userId: null,
    });
    const db = new NileDB(config);
    const pool = db.getConnection(config, true);
    config.db.user = 'another-login';
    expect(() => db.getConnection(config, true)).toThrow(/cannot change/);
    config.db.user = 'username';
    config.apiUrl = 'http://localhost/another-database/api';
    expect(() => db.getConnection(config, true)).toThrow(/cannot change/);
    config.apiUrl = 'http://localhost/api';
    config.db.password = async () => 'another-provider-token';
    expect(() => db.getConnection(config, true)).toThrow(/cannot change/);
    expect(db.connections.size).toBe(1);
    db.clear(config);
    expect(pool.ending).toBe(true);
  });

  it.each(['provider', 'TLS', 'Client'])(
    'rejects an OAuth %s change before returning an existing pool',
    (field) => {
      const provider = jest.fn(async () => 'fixture-token');
      const config = new Config({
        apiUrl: 'http://localhost/api',
        databaseName: 'database',
        user: 'login',
        oauthBearerToken: provider,
        db: { host: 'localhost', ssl: { rejectUnauthorized: true } },
      });
      const manager = new NileDB(config);
      const pool = manager.getConnection(config, true);
      try {
        if (field === 'provider')
          config.db.oauthBearerToken = async () => 'other-token';
        if (field === 'TLS') config.db.ssl = false;
        if (field === 'Client') config.db.Client = pg.Client;
        expect(() => manager.getConnection(config, true)).toThrow(
          /cannot change/
        );
        expect(manager.connections.size).toBe(1);
        expect(provider).not.toHaveBeenCalled();
      } finally {
        manager.clear(config);
      }
      expect(pool.ending).toBe(true);
    }
  );
});
