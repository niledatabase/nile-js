import pg from 'pg';

import { Config } from '../utils/Config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllowAny = any;

export function createProxyForPool(pool: pg.Pool, config: Config): pg.Pool {
  const { info, error } = config.logger('[pool]');
  return new Proxy<pg.Pool>(pool, {
    get(target: AllowAny, property) {
      if (property === 'query') {
        // give connection string a pass for these problems
        if (!config.db.connectionString) {
          if (!config.db.user || !config.db.password) {
            error(
              'Cannot connect to the database. User and/or password are missing. Generate them at https://console.thenile.dev'
            );
          } else if (!config.db.database) {
            error(
              'Unable to obtain database name. Is process.env.NILEDB_POSTGRES_URL set?'
            );
          }
        }
        const caller = target[property];
        return function query(...args: AllowAny) {
          info('query', ...args);
          // @ts-expect-error - not mine
          const called = caller.apply(this, args);
          return called;
        };
      }
      return target[property];
    },
  }) as pg.Pool;
}
