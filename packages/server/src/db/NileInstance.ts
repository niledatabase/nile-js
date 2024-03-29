/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';

import { Config } from '../utils/Config';
import { evictPool } from '../utils/Event';
import { AfterCreate } from '../types';
import Logger from '../utils/Logger';

class NileDatabase {
  pool: Pool;
  tenantId?: undefined | null | string;
  userId?: undefined | null | string;
  id: string;
  config: Config;
  timer: NodeJS.Timeout | undefined;

  constructor(config: Config, id: string) {
    const { warn } = Logger(config, '[NileInstance]');
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

    this.pool = new Pool(remaining);

    if (typeof afterCreate === 'function') {
      warn(
        'Providing an pool configuration will stop automatic tenant context setting.'
      );
    }

    // start the timer for cleanup
    this.startTimeout();
    this.pool.on('connect', async (client) => {
      const afterCreate: AfterCreate = makeAfterCreate(config);
      afterCreate(client, (err, _client) => {
        if (err) {
          _client.release();
        }
      });
      this.startTimeout();
    });
  }

  startTimeout() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(async () => {
      await this.pool.end();
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
        info('tenant id and user id set', config.userId, config.tenantId);
        done(err, conn);
      });
    }
    done(null, conn);
  };
}
