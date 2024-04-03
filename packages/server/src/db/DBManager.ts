import { Pool } from 'pg';

import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';
import Logger from '../utils/Logger';
import { ServerConfig } from '../types';

import NileDatabase from './NileInstance';

export default class DBManager {
  connections: Map<string, NileDatabase>;

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
    const { info } = Logger(config, '[DBManager]');
    this.connections = new Map();
    // add the base one, so you can at least query
    const id = this.makeId();
    info('constructor', id);
    this.connections.set(id, new NileDatabase(new Config(config), id));
    watchEvictPool((id) => {
      if (id && this.connections.has(id)) {
        this.connections.delete(id);
      }
    });
  }

  getConnection(config: ServerConfig): Pool {
    const { info } = Logger(config, '[DBManager]');
    const id = this.makeId(config.tenantId, config.userId);
    const existing = this.connections.get(id);
    info('# of instances:', this.connections.size);
    if (existing) {
      info('returning existing', id);
      return existing.pool;
    }
    const newOne = new NileDatabase(new Config(config), id);
    this.connections.set(id, newOne);
    info('created new', id);
    info('# of instances:', this.connections.size);
    return newOne.pool;
  }
}
