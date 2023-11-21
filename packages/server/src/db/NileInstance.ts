/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';

import { Config } from '../utils/Config';
// import { evictPool } from '../utils/Event';
import { AfterCreate, PgConnectionConfig, PoolConfig } from '../types';

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
    const poolConfig: PoolConfig = {
      min: 0,
      max: 10,
      log: (msg, lvl) => {
        console.log(lvl, msg);
      },
      ...config.db.pool,
    };
    console.log('constructor called?');
    const afterCreate: AfterCreate = (conn, done) => {
      conn.on('end', function endHandler(error: unknown) {
        console.log('ended', error, new Date().toJSON());
      });
      conn.on('error', function errorHandler(error: unknown) {
        // eslint-disable-next-line no-console
        console.log('Connection was terminated by server', error);
        done(error, conn);
      });

      if (config.tenantId) {
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
          console.log(
            'tenant id and user id set',
            config.userId,
            config.tenantId
          );
          done(err, conn);
        });
      }
      done(null, conn);
    };
    if (config.db.pool?.afterCreate) {
      // eslint-disable-next-line no-console
      console.log(
        'Providing an pool configuration will stop automatic tenant context setting.'
      );
    }
    poolConfig.afterCreate = afterCreate;

    this.config = {
      ...config,
      db: {
        ...config.db,
        connection: {
          ...(config.db.connection as PgConnectionConfig),
          database:
            (config.db.connection as PgConnectionConfig)?.database ??
            config.database,
        },
        pool: poolConfig,
      },
    };
    const knexConfig = { ...this.config.db, client: 'pg' };

    this.knex = knex(knexConfig);
    console.log(knexConfig);
    // start the timer for cleanup
    this.startTimeout();
    this.knex.on('query', async () => {
      console.log(this.knex.client.pool.numFree(), 'number of free pools');
      console.log(this.knex.client.pool.numUsed(), 'number of used pools');
      console.log(this.knex.client.pool.numPendingAcquires(), 'pending aquire');
      console.log(this.knex.client.pool.numPendingCreates(), 'pending create');
      this.startTimeout();
    });
    this.knex.on('query-success', () => {
      console.log('query OK');
    });
    this.knex.on('query-error', (err) => {
      console.log('Connection was terminated by server.', err);
    });
    this.knex.on('error', () => {
      console.log('something bad happened');
    });
    this.knex.client.pool.on('error', (...args: any) => {
      console.log('bad', args);
    });
  }

  startTimeout() {
    // this.knex.client.pool.release();
    if (this.timer) {
      console.log('clearing timeout');
      clearTimeout(this.timer);
    }
    // this.timer = setTimeout(async () => {
    // console.log('destroying knex');
    // await this.knex.client.pool.destroy();
    // await this.knex.destroy();
    // console.log('knex destroyed');
    // evictPool(this.id);
    // }, this.config.db.pool.idleTimeoutMillis);
  }
}

export type NileDatabaseI = (table?: string) => Knex;
export default NileDatabase;
