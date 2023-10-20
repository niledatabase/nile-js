import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

import NileDatabase, { NileDatabaseI } from './NileInstance';

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

  getConnection(config: Config): NileDatabaseI {
    const id = this.makeId(config.tenantId, config.userId);
    const existing = this.connections.get(id);
    if (existing) {
      return existing as unknown as NileDatabaseI;
    }
    this.connections.set(id, new NileDatabase(new Config(config), id));
    return this.connections.get(id) as unknown as NileDatabaseI;
  }
}
