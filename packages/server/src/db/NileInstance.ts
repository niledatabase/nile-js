/* eslint-disable @typescript-eslint/no-explicit-any */
import pg from 'pg';

import { Config } from '../utils/Config';
import { evictPool } from '../utils/Event';
import { AfterCreate } from '../types';
import Logger from '../utils/Logger';

import { createProxyForPool } from './PoolProxy';

class NileDatabase {
  pool: pg.Pool;
  tenantId?: undefined | null | string;
  userId?: undefined | null | string;
  id: string;
  config: Config;
  timer: NodeJS.Timeout | undefined;

  constructor(config: Config, id: string) {
    const { warn, info, debug } = Logger(config, '[NileInstance]');
    this.id = id;
    const poolConfig = {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000,
      ...config.db,
    };
    const { afterCreate, ...remaining } = poolConfig;

    config.db = poolConfig;
    this.config = config;
    const cloned = { ...this.config.db };
    cloned.password = '***';
    debug(`Connection pool config ${JSON.stringify(cloned)}`);

    this.pool = createProxyForPool(new pg.Pool(remaining), this.config);

    if (typeof afterCreate === 'function') {
      warn(
        'Providing an pool configuration will stop automatic tenant context setting.'
      );
    }

    // start the timer for cleanup
    this.startTimeout();
    this.pool.on('connect', async (client) => {
      debug(`pool connected ${this.id}`);
      this.startTimeout();
      const afterCreate: AfterCreate = makeAfterCreate(
        config,
        `${this.id}-${this.timer}`
      );
      afterCreate(client, (err) => {
        const { error } = Logger(config, '[after create callback]');
        if (err) {
          clearTimeout(this.timer);
          error('after create failed', {
            message: err.message,
            stack: err.stack,
          });
          evictPool(this.id);
        }
      });
    });
    this.pool.on('error', (err) => {
      clearTimeout(this.timer);
      info(`pool ${this.id} failed`, {
        message: err.message,
        stack: err.stack,
      });
      evictPool(this.id);
    });
    this.pool.on('release', (destroy) => {
      if (destroy) {
        clearTimeout(this.timer);
        evictPool(this.id);
        debug(`destroying pool ${this.id}`);
      }
    });
  }

  startTimeout() {
    const { debug } = Logger(this.config, '[NileInstance]');
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      debug(
        `Pool reached idleTimeoutMillis. ${this.id} evicted after ${
          Number(this.config.db.idleTimeoutMillis) ?? 30000
        }ms`
      );
      this.pool.end(() => {
        clearTimeout(this.timer);
        evictPool(this.id);
      });
    }, Number(this.config.db.idleTimeoutMillis) ?? 30000);
  }
  shutdown() {
    const { debug } = Logger(this.config, '[NileInstance]');
    debug(`attempting to shut down ${this.id}`);
    clearTimeout(this.timer);
    this.pool.end(() => {
      debug(`${this.id} has been shut down`);
    });
  }
}

export default NileDatabase;

function makeAfterCreate(config: Config, id: string): AfterCreate {
  const { error, warn, debug } = Logger(config, '[afterCreate]');
  return (conn, done) => {
    conn.on('error', function errorHandler(e: Error) {
      error(`Connection ${id} was terminated by server`, {
        message: e.message,
        stack: e.stack,
      });
      done(e, conn);
    });

    if (config.tenantId) {
      const query = [`SET nile.tenant_id = '${config.tenantId}'`];
      if (config.userId) {
        if (!config.tenantId) {
          warn('A user id cannot be set in context without a tenant id');
        }
        query.push(`SET nile.user_id = '${config.userId}'`);
      }

      // in this example we use pg driver's connection API
      conn.query(query.join(';'), function (err: Error) {
        if (err) {
          error('query connection failed', {
            cause: err.cause,
            stack: err.stack,
            message: err.message,
            name: err.name,
            id,
          });
        } else {
          if (query.length === 1) {
            debug(`connection context set: tenantId=${config.tenantId}`);
          }
          if (query.length === 2) {
            debug(
              `connection context set: tenantId=${config.tenantId} userId=${config.userId}`
            );
          }
        }

        done(err, conn);
      });
    }
    done(null, conn);
  };
}
