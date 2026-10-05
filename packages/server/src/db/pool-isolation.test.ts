import { Nile } from '../index';
import { postgresFixture } from '../../test/postgres-fixture';

function createInstance(
  databaseName: string,
  idleTimeoutMillis: number,
  port = 5432
) {
  return Nile({
    apiUrl: `https://${databaseName}.example.test/v2/databases/${databaseName}`,
    databaseId: databaseName,
    databaseName,
    user: `login-${databaseName}`,
    password: async () => `token-${databaseName}`,
    db: { host: 'localhost', port, idleTimeoutMillis },
  });
}

describe('independent Nile pool eviction', () => {
  it('expires only the pool owned by the instance with the elapsed idle timeout', async () => {
    jest.useFakeTimers();
    const first = createInstance('first', 20);
    const second = createInstance('second', 10000);
    const firstPool = first.db;
    const secondPool = second.db;
    try {
      await jest.advanceTimersByTimeAsync(70);
      expect(firstPool.ending).toBe(true);
      expect(secondPool.ending).toBe(false);
      expect(second.db).toBe(secondPool);
      expect(first.db).not.toBe(firstPool);
    } finally {
      first.db.clearConnections();
      secondPool.clearConnections();
      jest.useRealTimers();
    }
  });

  it.each(['error', 'release'])(
    'evicts only the owning pool on %s',
    async (event) => {
      const first = createInstance('first', 10000);
      const second = createInstance('second', 10000);
      const firstPool = first.db;
      const secondPool = second.db;
      try {
        firstPool.emit(event, new Error('connection failed'));
        expect(firstPool.ending).toBe(true);
        expect(secondPool.ending).toBe(false);
        expect(second.db).toBe(secondPool);
        expect(first.db).not.toBe(firstPool);
      } finally {
        first.db.clearConnections();
        secondPool.clearConnections();
      }
    }
  );

  it('ignores a late failure from an already evicted pool', () => {
    const nile = createInstance('first', 10000);
    const oldPool = nile.db;
    oldPool.emit('error', new Error('first failure'));
    const replacement = nile.db;
    try {
      oldPool.emit('release', new Error('late failed release'));
      expect(replacement.ending).toBe(false);
      expect(nile.db).toBe(replacement);
    } finally {
      replacement.clearConnections();
    }
  });

  it('preserves the other instance borrowed transaction after an error release', async () => {
    const server = await postgresFixture();
    const first = createInstance('first', 10000, server.port);
    const second = createInstance('second', 10000, server.port);
    const firstPool = first.db;
    const secondPool = second.db;
    const firstClient = await firstPool.connect();
    const secondClient = await secondPool.connect();
    let released = false;
    try {
      await secondClient.query('BEGIN');
      firstClient.release(new Error('first transaction failed'));
      expect(firstPool.ending).toBe(true);
      expect(secondPool.ending).toBe(false);
      expect((await secondClient.query('COMMIT')).command).toBe('COMMIT');
      secondClient.release();
      released = true;
      const reused = await secondPool.connect();
      try {
        expect(reused).toBe(secondClient);
        expect(server.passwords).toEqual(['token-first', 'token-second']);
        expect(server.queries).toEqual(['BEGIN', 'COMMIT']);
      } finally {
        reused.release();
      }
    } finally {
      if (!released) secondClient.release();
      firstPool.clearConnections();
      secondPool.clearConnections();
      await server.close();
    }
  });

  it('waits for its own borrowed transaction before completing idle eviction', async () => {
    const server = await postgresFixture();
    const nile = createInstance('first', 20, server.port);
    const other = createInstance('second', 10000);
    const pool = nile.db;
    const otherPool = other.db;
    const client = await pool.connect();
    let released = false;
    try {
      await client.query('BEGIN');
      await new Promise((resolve) => setTimeout(resolve, 70));
      expect(pool.ending).toBe(true);
      expect(pool.ended).toBe(false);
      expect((await client.query('COMMIT')).command).toBe('COMMIT');
      client.release();
      released = true;
      await new Promise<void>((resolve) =>
        pool.once('remove', () => resolve())
      );
      expect(otherPool.ending).toBe(false);
      expect(nile.db).not.toBe(pool);
    } finally {
      if (!released) client.release();
      nile.db.clearConnections();
      otherPool.clearConnections();
      await server.close();
    }
  });

  it('applies the initiating instance tenant and user to SQL after another instance runs', async () => {
    const server = await postgresFixture();
    const first = createInstance('first', 10000, server.port);
    const second = createInstance('second', 10000, server.port);
    try {
      await first.withContext({ tenantId: 'tenant-a', userId: 'user-a' });
      await second.withContext({ tenantId: 'tenant-b', userId: 'user-b' });
      await first.query('SELECT 1');
      expect(server.queries).toEqual([
        "SET nile.tenant_id = 'tenant-a';SET nile.user_id = 'user-a'",
        'SELECT 1',
      ]);
      expect(server.passwords).toEqual(['token-first']);
    } finally {
      first.db.clearConnections();
      second.db.clearConnections();
      await server.close();
    }
  });
});
