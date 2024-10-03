import { Pool } from 'pg';

import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';
import Logger from '../utils/Logger';
import { ServerConfig } from '../types';

import NileDatabase from './NileInstance';

export default class DBManager {
  connections: Map<string, NileDatabase>;
  cleared: boolean;
  private poolWatcherFn: (id: undefined | null | string) => void;

  private makeId(
    tenantId?: string | undefined | null,
    userId?: string | undefined | null
  ) {
    if (tenantId && userId) {
      return `${tenantId}:${userId}`;
    }
    if (tenantId) {
      return `${tenantId}`;
    }
    return 'base';
  }
  constructor(config: ServerConfig) {
    this.cleared = false;
    this.connections = new Map();
    this.poolWatcherFn = this.poolWatcher(config);
    watchEvictPool(this.poolWatcherFn);
  }
  poolWatcher = (config: ServerConfig) => (id: undefined | null | string) => {
    const { info } = Logger(config, '[DBManager]');
    if (id && this.connections.has(id)) {
      info('Removing', id, 'from db connection pool.');
      this.connections.delete(id);
    } else {
      info('missed eviction of', id);
    }
  };

  getConnection = (config: ServerConfig): Pool => {
    const { info } = Logger(config, '[DBManager]');
    const id = this.makeId(config.tenantId, config.userId);

    const existing = this.connections.get(id);
    info('# of instances:', this.connections.size);
    if (existing) {
      info('returning existing', id);
      existing.startTimeout();
      return existing.pool;
    }
    const newOne = new NileDatabase(new Config(config), id);
    this.connections.set(id, newOne);
    info('created new', id);
    info('# of instances:', this.connections.size);
    if (this.cleared) {
      this.cleared = false;
    }
    return newOne.pool;
  };

  clear = (config: ServerConfig) => {
    const { info } = Logger(config, '[DBManager]');
    info('Clearing all connections', this.connections.size);
    this.cleared = true;
    this.connections.clear();
  };
}
