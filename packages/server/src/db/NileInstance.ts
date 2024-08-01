/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';

import { Config } from '../utils/Config';
import { evictPool } from '../utils/Event';
import { AfterCreate } from '../types';
import Logger from '../utils/Logger';

import { createProxyForPool } from './PoolProxy';

class NileDatabase {
  pool: Pool;
  tenantId?: undefined | null | string;
  userId?: undefined | null | string;
  id: string;
  config: Config;
  timer: NodeJS.Timeout | undefined;

  constructor(config: Config, id: string) {
    const { warn, info } = Logger(config, '[NileInstance]');
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
    info(this.config.db);

    this.pool = createProxyForPool(new Pool(remaining), this.config);

    if (typeof afterCreate === 'function') {
      warn(
        'Providing an pool configuration will stop automatic tenant context setting.'
      );
    }

    // start the timer for cleanup
    this.startTimeout();
    this.pool.on('connect', async (client) => {
      info('pool connected');
      const afterCreate: AfterCreate = makeAfterCreate(config);
      afterCreate(client, (err) => {
        const { error } = Logger(config, '[after create callback]');
        if (err) {
          error('after create failed', err);
          evictPool(this.id);
        }
      });

      this.startTimeout();
    });
    this.pool.on('error', async (e) => {
      info('pool failed', e);
      if (this.timer) {
        clearTimeout(this.timer);
      }
      evictPool(this.id);
    });
  }

  startTimeout() {
    const { info } = Logger(this.config, '[NileInstance]');
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(async () => {
      info(
        'Pool reached idleTimeoutMillis.',
        this.id,
        'evicted after',
        this.config.db.idleTimeoutMillis,
        'ms'
      );
      await this.pool.end(() => {
        info('Pool end called');
        // something odd going on here. Without the callback, pool.end() is flakey
      });
      evictPool(this.id);
    }, this.config.db.idleTimeoutMillis);
  }
}

export default NileDatabase;

function makeAfterCreate(config: Config): AfterCreate {
  const { warn, info } = Logger(config, '[afterCreate]');
  return (conn, done) => {
    conn.on('error', function errorHandler(error: Error) {
      warn('Connection was terminated by server', error);
      done(error, conn);
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
        if (config.tenantId) {
          info('[tenant id]', config.tenantId);
        }
        if (config.userId) {
          info('[user id]', config.userId);
        }
        done(err, conn);
      });
    }
    done(null, conn);
  };
}
