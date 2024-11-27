import { Pool } from 'pg';

import { ServerConfig } from './types';
import { Config } from './utils/Config';
import { watchTenantId, watchToken, watchUserId } from './utils/Event';
import DbManager from './db';
import { Api } from './Api';

export class Server {
  config: Config;
  api: Api;
  private manager!: DbManager;

  constructor(config?: ServerConfig) {
    this.config = new Config(config as ServerConfig, '[initial config]');
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
    this.api.updateConfig(this.config);
  }

  async init(cfg?: Config) {
    const updatedConfig = await this.config.configure({
      ...this.config,
      ...cfg,
    });
    this.setConfig(updatedConfig);

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
   * A convenience function that applies a config and ensures whatever was passed is set properly
   */

  getInstance(config: ServerConfig): Server {
    const _config = { ...this.config, ...config };

    // be sure the config is up to date
    const updatedConfig = new Config(_config);
    this.setConfig(updatedConfig);
    // propagate special config items
    this.tenantId = updatedConfig.tenantId;
    this.userId = updatedConfig.userId;
    // if we have a token, update it, else use the one that was there
    if (updatedConfig.api.token) {
      this.token = updatedConfig.api.token;
    }
    this.databaseId = updatedConfig.databaseId;

    return this;
  }
}

let server: Server;
export async function create(config?: ServerConfig): Promise<Server> {
  if (!server) {
    server = new Server(config);
  }
  if (config) {
    return await server.init(new Config(config));
  }
  return await server.init();
}

export default create;
