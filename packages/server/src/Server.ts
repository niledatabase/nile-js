import { Pool } from 'pg';

import { ServerConfig } from './types';
import { Config } from './utils/Config';
import { watchTenantId, watchToken, watchUserId } from './utils/Event';
import DbManager from './db';
import { getServerId, makeServerId } from './utils/Server';
import { Api } from './Api';

export class Server {
  config: Config;
  api: Api;
  private manager!: DbManager;
  private servers: Map<string, Server>;

  constructor(config?: ServerConfig) {
    this.config = new Config(config as ServerConfig, '[initial config]');
    this.servers = new Map();
    this.api = new Api(this.config);
    this.manager = new DbManager(this.config);

    watchTenantId((tenantId) => {
      this.tenantId = tenantId;
    });

    watchUserId((userId) => {
      this.userId = userId;
    });

    watchToken((token) => {
      this.token = token;
    });
  }

  setConfig(cfg: Config) {
    this.config = new Config(cfg);
  }

  async init(cfg?: Config) {
    const updatedConfig = await this.config.configure({
      ...this.config,
      ...cfg,
    });
    this.setConfig(updatedConfig);

    this.manager.clear(this.config);
    this.manager = new DbManager(this.config);
    this.api = new Api(this.config);
    return this;
  }

  set databaseId(val: string | void) {
    if (val) {
      this.config.databaseId = val;
      this.api.users.databaseId = val;
      this.api.tenants.databaseId = val;
    }
  }

  get userId(): string | undefined | null {
    return this.config.userId;
  }

  set userId(userId: string | undefined | null) {
    this.databaseId = this.config.databaseId;

    this.config.userId = userId;

    if (this.api) {
      this.api.users.userId = this.config.userId;
      this.api.tenants.userId = this.config.userId;
    }
  }

  get tenantId(): string | undefined | null {
    return this.config.tenantId;
  }

  set tenantId(tenantId: string | undefined | null) {
    this.databaseId = this.config.databaseId;
    this.config.tenantId = tenantId;

    if (this.api) {
      this.api.users.tenantId = tenantId;
      this.api.tenants.tenantId = tenantId;
    }
  }

  get token(): string | undefined | null {
    return this.config?.api?.token;
  }

  set token(token: string | undefined | null) {
    if (token) {
      this.config.api.token = token;
      if (this.api) {
        this.api.users.api.token = token;
        this.api.tenants.api.token = token;
      }
    }
  }
  get db(): Pool {
    return this.manager.getConnection(this.config);
  }

  /**
   * A utility function if you want to manage different NileDB instances yourself
   * returns the global Server object, an existing server that's already been configured,
   * or a new one if the config isn't in the cache
   */

  getInstance(config: ServerConfig): Server {
    const _config = { ...this.config, ...config };
    const serverId = getServerId(_config);
    const currentServerId = makeServerId(this.config);
    if (serverId === currentServerId) {
      return this;
    }
    const existing = this.servers.get(serverId);

    if (existing) {
      // be sure the config is up to date
      const updatedConfig = new Config(_config);
      existing.setConfig(updatedConfig);
      // propagate special config items
      existing.tenantId = updatedConfig.tenantId;
      existing.userId = updatedConfig.userId;
      existing.token = updatedConfig.api.token;
      existing.databaseId = updatedConfig.databaseId;
      return existing;
    }

    const newServer = new Server(_config);

    this.servers.set(serverId, newServer);

    return newServer;
  }
}

export async function create(config?: ServerConfig): Promise<Server> {
  const server = new Server(config);
  return await server.init();
}

export default create;
