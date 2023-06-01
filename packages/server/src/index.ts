import knex, { Knex } from 'knex';

import { ServerConfig } from './types';
import { Config } from './utils/Config';
import Auth from './auth';
import Users from './users';
import Tenants from './tenants';

class Server {
  config: Config;
  api: {
    auth: Auth;
    users: Users;
    tenants: Tenants;
  };
  db: Knex;

  constructor(config: ServerConfig) {
    this.config = new Config(config);
    const auth = new Auth(this.config);
    const users = new Users(this.config);
    const tenants = new Tenants(this.config);
    this.api = {
      auth,
      users,
      tenants,
    };
    const dbConfig = {
      ...this.config.db,
      client: 'pg',
    };
    this.db = knex(dbConfig);
  }

  get tenantId(): string | undefined {
    return this.config.tenantId;
  }

  set tenantId(tenantId: string | undefined) {
    if (tenantId) {
      this.config.tenantId = tenantId;
      this.api.auth.tenantId = tenantId;
      this.api.users.tenantId = tenantId;
    }
  }
}

export default Server;
