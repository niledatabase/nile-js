/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';

import { Config } from '../utils/Config';

// doing this now, to provide flexibility later
class NileDatabase {
  knex: Knex;
  db: Knex;
  tenantId?: undefined | null | string;
  userId?: undefined | null | string;
  config: any;

  constructor(config: Config) {
    this.config = { ...config, client: 'pg' };
    this.knex = knex(this.config);
    // Create a proxy to intercept method calls
    // @ts-expect-error - proxy, but knex
    this.db = new Proxy(this, {
      get: (target, method) => {
        if (method === 'tenantId') {
          return this.tenantId;
        }
        if (method === 'userId') {
          return this.userId;
        }
        if (method === 'db') {
          return (...args: any) => {
            //@ts-expect-error - its a string
            return target.knex.table(...args);
          };
        }
        //@ts-expect-error - its a string
        if (typeof target.knex[method] === 'function') {
          return (...args: any) => {
            //@ts-expect-error - its a string
            return target.knex[method](...args);
          };
        } else {
          return target.knex;
        }
      },
    });
  }
  ensureUpToDate() {
    // Close the existing pool connections and update the Knex instance with the latest config
    this.knex.destroy();
    this.knex = knex({ ...this.config.db, client: 'pg' });
  }
  setConfig(newConfig: Config) {
    const { tenantId, userId } = newConfig;
    this.tenantId = tenantId;
    this.userId = userId;
    let poolConfig = {};
    const afterCreate = (
      conn: {
        on: any;
        query: (query: string, cb: (err: unknown) => void) => void;
      },
      done: (err: unknown, conn: unknown) => void
    ) => {
      // console.log(this.tenantId, this.userId, 'in create');
      const query = [`SET nile.tenant_id = '${this.tenantId}'`];
      if (this.userId) {
        if (!this.tenantId) {
          // eslint-disable-next-line no-console
          console.warn(
            'A user id cannot be set in context without a tenant id'
          );
        }
        query.push(`SET nile.user_id = '${this.userId}'`);
      }
      // in this example we use pg driver's connection API
      conn.query(query.join(';'), function (err: unknown) {
        done(err, conn);
      });
    };
    if (this.tenantId) {
      if (newConfig.db.pool?.afterCreate) {
        // eslint-disable-next-line no-console
        console.log(
          'Providing an  pool configuration will stop automatic tenant context setting.'
        );
      } else if (newConfig.db.pool) {
        poolConfig = {
          ...newConfig.db.pool,
          afterCreate,
        };
      } else if (!newConfig.db.pool) {
        poolConfig = {
          afterCreate,
        };
      }
    }

    this.config = { ...newConfig, db: { ...newConfig.db, pool: poolConfig } };
    this.ensureUpToDate();
  }
}

export type NileDatabaseI = (table?: string) => Knex;
export default NileDatabase;
