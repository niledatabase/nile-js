import { Pool } from 'pg';

import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

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
  constructor(config: Config) {
    this.connections = new Map();
    // add the base one, so you can at least query
    const id = this.makeId();
    this.connections.set(id, new NileDatabase(new Config(config), id));
    watchEvictPool((id) => {
      if (id && this.connections.has(id)) {
        this.connections.delete(id);
      }
    });
  }

  getConnection(config: Config): Pool {
    const id = this.makeId(config.tenantId, config.userId);
    const existing = this.connections.get(id);
    if (existing) {
      return existing.pool;
    }
    const newOne = new NileDatabase(new Config(config), id);
    this.connections.set(id, newOne);
    return newOne.pool;
  }
}
