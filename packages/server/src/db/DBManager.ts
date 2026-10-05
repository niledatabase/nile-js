import pg from 'pg';

import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';
import Logger from '../utils/Logger';
import { getNileContext } from '../api/utils/request-context';

import NileDatabase from './NileInstance';

export default class DBManager {
  connections: Map<string, NileDatabase>;
  cleared: boolean;
  private poolWatcherFn: (id: undefined | null | string) => void;
  private readonly authenticationScope: unknown[];

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
    this.authenticationScope = this.getAuthenticationScope(config);
    this.poolWatcherFn = this.poolWatcher(config);
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

  getConnection = (config: Config, noContext = false): pg.Pool => {
    const scope = this.getAuthenticationScope(config);
    if (
      (this.authenticationScope
        .slice(0, 2)
        .some((value) => typeof value === 'function') ||
        scope.slice(0, 2).some((value) => typeof value === 'function')) &&
      scope.some((value, index) => value !== this.authenticationScope[index])
    ) {
      throw new Error(
        'A callback-authenticated Nile instance cannot change its database, login, host, authentication provider, TLS, or Client. Create a separate Nile instance.'
      );
    }
    const { info } = Logger(config)('[DBManager]');
    const { tenantId, userId } = noContext ? {} : getNileContext(config);
    const id = this.makeId(tenantId, userId);

    const existing = this.connections.get(id);
    info(`# of instances: ${this.connections.size}`);
    if (existing) {
      info(`returning existing ${id}`);
      existing.startTimeout();
      return existing.pool;
    }
    const newOne = new NileDatabase(config.db, config.logger, id);
    this.connections.set(id, newOne);
    watchEvictPool((poolId) => {
      if (this.connections.get(id) === newOne) {
        this.poolWatcherFn(poolId);
      }
    }, newOne);
    info(`created new ${id}`);
    info(`# of instances: ${this.connections.size}`);
    if (this.cleared) {
      this.cleared = false;
    }
    return newOne.pool;
  };

  private getAuthenticationScope(config: Config): unknown[] {
    const {
      password,
      oauthBearerToken,
      user,
      database,
      host,
      port,
      connectionString,
      ssl,
      Client,
    } = config.db;
    const tls = typeof ssl === 'object' ? ssl : undefined;
    return [
      password,
      oauthBearerToken,
      user,
      database,
      host,
      port,
      connectionString,
      ssl,
      Client,
      tls?.ca,
      tls?.rejectUnauthorized,
      tls?.checkServerIdentity,
      tls?.servername,
      config.apiUrl,
    ];
  }

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
