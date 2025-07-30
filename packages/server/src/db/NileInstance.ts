/* eslint-disable @typescript-eslint/no-explicit-any */
import pg, { PoolConfig } from 'pg';

import { evictPool } from '../utils/Event';
import { AfterCreate, NilePoolConfig } from '../types';
import { Loggable, LogReturn } from '../utils/Logger';

import { createProxyForPool } from './PoolProxy';

class NileDatabase {
  pool: pg.Pool;
  tenantId?: undefined | null | string;
  userId?: undefined | null | string;
  id: string;
  logger: Loggable;
  timer: NodeJS.Timeout | undefined;
  config: PoolConfig;
  constructor(config: NilePoolConfig, logger: LogReturn, id: string) {
    this.logger = logger('[NileInstance]');
    this.id = id;
    const poolConfig = {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000,
      ...config,
    };
    const { afterCreate, ...remaining } = poolConfig;

    this.config = remaining;

    const cloned = { ...config };
    cloned.password = '***';
    this.logger.debug(`Connection pool config ${JSON.stringify(cloned)}`);

    this.pool = createProxyForPool(
      new pg.Pool(remaining),
      this.config,
      logger,
      id === 'base' ? [] : id.split(':')
    );

    if (typeof afterCreate === 'function') {
      this.logger.warn(
        'Providing an pool configuration will stop automatic tenant context setting.'
      );
    }

    // start the timer for cleanup
    this.startTimeout();
    this.pool.on('connect', async (client) => {
      this.logger.debug(`pool connected ${this.id}`);
      this.startTimeout();
      const afterCreate: AfterCreate = makeAfterCreate(
        logger,
        `${this.id}|${this.timer}`
      );
      afterCreate(client, (err) => {
        const { error } = logger('[after create callback]');
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
      this.logger.info(`pool ${this.id} failed`, {
        message: err.message,
        stack: err.stack,
      });
      evictPool(this.id);
    });
    this.pool.on('release', (destroy) => {
      if (destroy) {
        clearTimeout(this.timer);
        evictPool(this.id);
        this.logger.debug(`destroying pool ${this.id}`);
      }
    });
  }

  startTimeout() {
    const { debug } = this.logger;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      debug(
        `Pool reached idleTimeoutMillis. ${this.id} evicted after ${
          Number(this.config.idleTimeoutMillis) ?? 30000
        }ms`
      );
      this.pool.end(() => {
        clearTimeout(this.timer);
        evictPool(this.id);
      });
    }, Number(this.config.idleTimeoutMillis) ?? 30000);
  }
  shutdown() {
    const { debug } = this.logger;
    debug(`attempting to shut down ${this.id}`);
    clearTimeout(this.timer);
    this.pool.end(() => {
      debug(`${this.id} has been shut down`);
    });
  }
}

export default NileDatabase;

function makeAfterCreate(logger: LogReturn, id: string): AfterCreate {
  const { error, warn, debug } = logger('[afterCreate]');
  return (conn, done) => {
    conn.on('error', function errorHandler(e: Error) {
      error(`Connection ${id} was terminated by server`, {
        message: e.message,
        stack: e.stack,
      });
      done(e, conn);
    });

    const [context] = id.split('|');
    // the main ctx may mutate independent of this, the config at instantiation is the source of truth
    const [tenantId, userId] = context.split(':');
    if (tenantId !== 'base') {
      const query = [`SET nile.tenant_id = '${tenantId}'`];
      if (userId) {
        if (!tenantId) {
          warn('A user id cannot be set in context without a tenant id');
        }
        query.push(`SET nile.user_id = '${userId}'`);
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
            debug(`connection context set: tenantId=${tenantId}`);
          }
          if (query.length === 2) {
            debug(
              `connection context set: tenantId=${tenantId} userId=${userId}`
            );
          }
        }

        done(err, conn);
      });
    }
    done(null, conn);
  };
}
