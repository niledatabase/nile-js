import { Pool } from 'pg';

import { Config } from '../utils/Config';
import { closeEvictPool, watchEvictPool } from '../utils/Event';
import Logger from '../utils/Logger';
import { ServerConfig } from '../types';

import NileDatabase from './NileInstance';
import { isUUID } from './isUUID';

export default class DBManager {
  connections: Map<string, NileDatabase>;
  cleared: boolean;

  private makeId(
    tenantId?: string | undefined | null,
    userId?: string | undefined | null
  ) {
    if (isUUID(tenantId) && isUUID(userId)) {
      return `${tenantId}:${userId}`;
    }
    if (isUUID(tenantId)) {
      return `${tenantId}`;
    }
    return 'base';
  }
  constructor(config: ServerConfig) {
    const { info } = Logger(config, '[DBManager]');
    this.cleared = false;
    this.connections = new Map();
    // add the base one, so you can at least query
    const id = this.makeId();
    info('constructor', id);
    this.connections.set(id, new NileDatabase(new Config(config), id));
    watchEvictPool(this.poolWatcher(config));
  }
  poolWatcher = (config: ServerConfig) => (id: undefined | null | string) => {
    const { info } = Logger(config, '[DBManager]');
    if (id && this.connections.has(id)) {
      info('Removing', id, 'from db connection pool.');
      this.connections.delete(id);
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
    // resume listening to the evict pool if a connection is requested.
    if (this.cleared) {
      this.cleared = false;
      watchEvictPool(this.poolWatcher(config));
    }
    return newOne.pool;
  };

  clear = (config: ServerConfig) => {
    const { info } = Logger(config, '[DBManager]');
    info('Clearing all connections', this.connections.size);
    closeEvictPool(this.poolWatcher(config));
    this.cleared = true;
    this.connections.clear();
  };
}
