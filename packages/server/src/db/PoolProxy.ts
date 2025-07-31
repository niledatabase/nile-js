import pg from 'pg';

import { NilePoolConfig } from '../types';
import { LogReturn } from '../utils/Logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllowAny = any;

export function createProxyForPool(
  pool: pg.Pool,
  config: NilePoolConfig,
  logger: LogReturn,
  context: string[]
): pg.Pool {
  const { info, error } = logger('[pool]');
  return new Proxy<pg.Pool>(pool, {
    get(target: AllowAny, property) {
      if (property === 'query') {
        // give connection string a pass for these problems
        if (!config.connectionString) {
          if (!config.user || !config.password) {
            error(
              'Cannot connect to the database. User and/or password are missing. Generate them at https://console.thenile.dev'
            );
          } else if (!config.database) {
            error(
              'Unable to obtain database name. Is process.env.NILEDB_POSTGRES_URL set?'
            );
          }
        }
        const caller = target[property];
        return function query(...args: AllowAny) {
          let log = '[QUERY]';
          const [tenantId, userId] = context;
          if (tenantId) {
            log = `${log}[TENANT:${tenantId}]`;
          }
          if (userId) {
            log = `${log}[USER:${userId}]`;
          }
          info(log, ...args);
          // @ts-expect-error - not mine
          const called = caller.apply(this, args);
          return called;
        };
      }
      return target[property];
    },
  }) as pg.Pool;
}
