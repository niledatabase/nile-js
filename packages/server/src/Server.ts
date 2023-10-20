import { ServerConfig } from './types';
import { Config } from './utils/Config';
import Auth from './auth';
import Users from './users';
import Tenants from './tenants';
import { watchTenantId, watchToken, watchUserId } from './utils/Event';
import DbManager, { NileDatabaseI } from './db';
import DBManager from './db/DBManager';

type Api = {
  auth: Auth;
  users: Users;
  tenants: Tenants;
};

const init = (config: Config): [Api] => {
  const auth = new Auth(config);
  const users = new Users(config);
  const tenants = new Tenants(config);
  return [
    {
      auth,
      users,
      tenants,
    },
  ];
};

class Server {
  config: Config;
  api: Api;
  private manager: DbManager;

  constructor(config?: ServerConfig) {
    this.config = new Config(config);
    const [api] = init(this.config);
    this.api = api;
    this.manager = new DBManager(this.config);

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

  set database(val: string | void) {
    if (val) {
      this.config.database = val;
      this.config.db.connection.database = val;
      this.api.auth.database = val;
      this.api.users.database = val;
      this.api.tenants.database = val;
    }
  }

  set workspace(val: string | void) {
    if (val) {
      this.config.workspace = val;
      this.api.auth.workspace = val;
      this.api.users.workspace = val;
      this.api.tenants.workspace = val;
    }
  }

  get userId(): string | undefined | null {
    return this.config.userId;
  }

  set userId(userId: string | undefined | null) {
    this.database = this.config.database;

    this.config.userId = userId;

    if (this.api) {
      this.api.auth.userId = this.config.userId;
      this.api.users.userId = this.config.userId;
      this.api.tenants.userId = this.config.userId;
    }
  }

  get tenantId(): string | undefined | null {
    return this.config.tenantId;
  }

  set tenantId(tenantId: string | undefined | null) {
    this.database = this.config.database;
    this.config.tenantId = tenantId;

    if (this.api) {
      this.api.auth.tenantId = tenantId;
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
        this.api.auth.api.token = token;
        this.api.users.api.token = token;
        this.api.tenants.api.token = token;
      }
    }
  }
  get db(): NileDatabaseI {
    // only need to interact with the knex object
    //@ts-expect-error - because that's where it is in the proxy
    return this.manager.getConnection(this.config).knex;
  }
}

// export default Server;
export default function Nile(config: ServerConfig) {
  const server = new Server(config);
  server.setConfig(new Config(config as ServerConfig));
  return server;
}
