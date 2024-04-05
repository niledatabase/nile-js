import { Pool } from 'pg';

import { Config } from '../utils/Config';
import Logger from '../utils/Logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllowAny = any;

export function createProxyForPool(pool: Pool, config: Config): Pool {
  const { info, error } = Logger(config, '[pool]');
  return new Proxy<Pool>(pool, {
    get(target: AllowAny, property) {
      if (property === 'query') {
        if (!config.user || !config.password) {
          error(
            'Cannot connect to the database. User and/or password are missing. Generate them at https://console.thenile.dev'
          );
        } else if (!config.db.database) {
          error(
            'Database id is missing from the config. Either call `nile.init()` when you create the NileDB server or set NILEDB_ID in your .env'
          );
        }
        const caller = target[property];
        return function query(...args: AllowAny) {
          info(...args);
          // @ts-expect-error - not mine
          const called = caller.apply(this, args);
          return called;
        };
      }
      return target[property];
    },
  }) as Pool;
}
