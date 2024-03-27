/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';

import { Config } from '../utils/Config';
import { evictPool } from '../utils/Event';
import { AfterCreate, PgConnectionConfig, PoolConfig } from '../types';

class NileDatabase {
  knex: Knex;
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
      idleTimeoutMillis: 30000,
      ...config.db.pool,
    };

    const database =
      (config.db.connection as PgConnectionConfig)?.database ??
      config.databaseId;

    this.config = {
      ...config,
      db: {
        ...config.db,
        connection: {
          ...(config.db.connection as PgConnectionConfig),
          database,
        },
        pool: poolConfig,
      },
    };

    this.knex = knex({ ...this.config.db, client: 'pg' });

    if (config.db.pool?.afterCreate) {
      console.log(
        'Providing an pool configuration will stop automatic tenant context setting.'
      );
    } else {
      const afterCreate: AfterCreate = makeAfterCreate(config);
      poolConfig.afterCreate = afterCreate;
    }

    // start the timer for cleanup
    this.startTimeout();
    this.knex.on('query', async () => {
      this.startTimeout();
    });
  }

  startTimeout() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(async () => {
      await this.knex.client.pool.destroy();
      await this.knex.destroy();
      evictPool(this.id);
    }, this.config.db.pool.idleTimeoutMillis);
  }
}

export type NileDatabaseI = (table?: string) => Knex;

export default NileDatabase;

function makeAfterCreate(config: Config): AfterCreate {
  return (conn, done) => {
    conn.on('error', function errorHandler(error: unknown) {
      console.log('Connection was terminated by server', error);
      done(error, conn);
    });

    if (config.tenantId) {
      const query = [`SET nile.tenant_id = '${config.tenantId}'`];
      if (config.userId) {
        if (!config.tenantId) {
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
}
