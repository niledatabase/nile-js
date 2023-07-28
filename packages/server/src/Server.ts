import { Knex } from 'knex';

import { ServerConfig } from './types';
import { Config } from './utils/Config';
import Auth from './auth';
import Users from './users';
import Tenants from './tenants';
import { watchTenantId } from './utils/Event';
import _knex from './db';

type Api = {
  auth: Auth;
  users: Users;
  tenants: Tenants;
};
const init = (config: Config): [Api, Knex] => {
  const auth = new Auth(config);
  const users = new Users(config);
  const tenants = new Tenants(config);
  const dbConfig = {
    ...config.db,
    client: 'pg',
  };
  return [
    {
      auth,
      users,
      tenants,
    },
    _knex(dbConfig),
  ];
};

class Server {
  config: Config;
  api: Api;
  db: Knex;

  constructor(config?: ServerConfig) {
    this.config = new Config(config);
    const [api, knex] = init(this.config);
    this.api = api;
    this.db = knex;

    watchTenantId((tenantId) => {
      this.tenantId = tenantId;
    });
  }

  setConfig(cfg: Config) {
    // if a config has changed, re init everything
    this.api = null as unknown as Api;
    this.db = null as unknown as Knex;
    const [api, knex] = init(cfg);
    this.api = api;
    this.db = knex;

    this.config = cfg;
  }

  get tenantId(): string | undefined | null {
    return this.config.tenantId;
  }

  set tenantId(tenantId: string | undefined | null) {
    if (tenantId) {
      this.config.tenantId = tenantId;
      if (this.api) {
        this.api.auth.tenantId = tenantId;
        this.api.users.tenantId = tenantId;
        this.api.tenants.tenantId = tenantId;
      }
    }
  }

  get token(): string | undefined {
    return this.config?.api?.token;
  }

  set token(token: string | undefined) {
    if (token) {
      this.config.api.token = token;
      if (this.api) {
        this.api.auth.api.token = token;
        this.api.users.api.token = token;
        this.api.tenants.api.token = token;
      }
    }
  }
}

const server = new Server();

export default function Nile(config: ServerConfig) {
  server.setConfig(new Config(config as ServerConfig));
  return server;
}
