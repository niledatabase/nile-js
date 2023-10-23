/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';

import { Config } from '../utils/Config';
import { evictPool } from '../utils/Event';

// doing this now, to provide flexibility later
class NileDatabase {
  knex: Knex;
  // db: Knex;
  tenantId?: undefined | null | string;
  userId?: undefined | null | string;
  id: string;
  config: any;
  timer: NodeJS.Timeout | undefined;

  constructor(config: Config, id: string) {
    this.id = id;
    let poolConfig = {};
    const afterCreate = (
      conn: {
        on: any;
        query: (query: string, cb: (err: unknown) => void) => void;
      },
      done: (err: unknown, conn: unknown) => void
    ) => {
      const query = [`SET nile.tenant_id = '${config.tenantId}'`];
      if (config.userId) {
        if (!config.tenantId) {
          // eslint-disable-next-line no-console
          console.warn(
            'A user id cannot be set in context without a tenant id'
          );
        }
        query.push(`SET nile.user_id = '${config.userId}'`);
      }
      // in this example we use pg driver's connection API
      conn.query(query.join(';'), function (err: unknown) {
        done(err, conn);
      });
    };
    if (config.tenantId) {
      if (config.db.pool?.afterCreate) {
        // eslint-disable-next-line no-console
        console.log(
          'Providing an pool configuration will stop automatic tenant context setting.'
        );
      } else if (config.db.pool) {
        poolConfig = {
          ...config.db.pool,
          afterCreate,
        };
      } else if (!config.db.pool) {
        poolConfig = {
          afterCreate,
        };
      }
    }

    this.config = {
      ...config,
      db: {
        ...config.db,
        connection: {
          ...config.db.connection,
          database: config.db.connection.database ?? config.database,
        },
        pool: poolConfig,
      },
    };
    const knexConfig = { ...this.config.db, client: 'pg' };

    // start the timer for cleanup
    this.startTimeout();

    this.knex = knex(knexConfig);
    this.knex.on('query', () => {
      this.startTimeout();
    });
  }

  startTimeout() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.knex.destroy();
      evictPool(this.id);
    }, this.config.db.pool.idleTimeoutMillis ?? 30000);
  }
}

export type NileDatabaseI = (table?: string) => Knex;
export default NileDatabase;
