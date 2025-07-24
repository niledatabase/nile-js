import pg from 'pg';

import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';
import Logger from '../utils/Logger';

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
  constructor(config: Config) {
    this.cleared = false;
    this.connections = new Map();
    this.poolWatcherFn = this.poolWatcher(config);
    watchEvictPool(this.poolWatcherFn);
  }
  poolWatcher = (config: Config) => (id: undefined | null | string) => {
    const { info, warn } = Logger(config)('[DBManager]');
    if (id && this.connections.has(id)) {
      info(`Removing ${id} from db connection pool.`);
      const connection = this.connections.get(id);
      connection?.shutdown();
      this.connections.delete(id);
    } else {
      warn(`missed eviction of ${id}`);
    }
  };

  getConnection = (config: Config): pg.Pool => {
    const { info } = Logger(config)('[DBManager]');
    const id = this.makeId(config.context.tenantId, config.context.userId);

    const existing = this.connections.get(id);
    info(`# of instances: ${this.connections.size}`);
    if (existing) {
      info(`returning existing ${id}`);
      existing.startTimeout();
      return existing.pool;
    }
    const newOne = new NileDatabase(config, id);
    this.connections.set(id, newOne);
    info(`created new ${id}`);
    info(`# of instances: ${this.connections.size}`);
    if (this.cleared) {
      this.cleared = false;
    }
    return newOne.pool;
  };

  clear = (config: Config) => {
    const { info } = Logger(config)('[DBManager]');
    info(`Clearing all connections ${this.connections.size}`);
    this.cleared = true;
    this.connections.forEach((connection) => {
      connection.shutdown();
    });
    this.connections.clear();
  };
}
