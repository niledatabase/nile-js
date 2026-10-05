import { postgresFixture } from '../../test/postgres-fixture';
import { Config } from '../utils/Config';
import Logger from '../utils/Logger';

import { PoolWithLogger } from './PoolWithLogger';

describe('pg password callback', () => {
  it('preserves the callback through configuration and requests a new password per physical connection', async () => {
    const server = await postgresFixture();
    const password = jest
      .fn()
      .mockResolvedValueOnce('first-token')
      .mockResolvedValueOnce('second-token');
    const config = new Config({
      apiUrl: 'http://localhost/api',
      user: 'login',
      databaseName: 'database',
      password,
      db: { host: 'localhost', port: server.port, maxUses: 1, max: 1 },
    });
    const pool = new PoolWithLogger(config.db, Logger(), []);
    expect(password).not.toHaveBeenCalled();
    try {
      const first = await pool.connect();
      first.release();
      const second = await pool.connect();
      second.release();
      expect(server.passwords).toEqual(['first-token', 'second-token']);
      expect(password).toHaveBeenCalledTimes(2);
    } finally {
      await pool.end();
      await server.close();
    }
  });

  it('propagates callback rejection without sending an old or static password', async () => {
    const server = await postgresFixture();
    const password = jest.fn().mockRejectedValue(new Error('identity denied'));
    const config = new Config({
      apiUrl: 'http://localhost/api',
      user: 'login',
      databaseName: 'database',
      password,
      db: { host: 'localhost', port: server.port },
    });
    const pool = new PoolWithLogger(config.db, Logger(), []);
    try {
      await expect(pool.connect()).rejects.toThrow('identity denied');
      expect(server.passwords).toEqual([]);
    } finally {
      await pool.end();
      await server.close();
    }
  });
});
