import { Knex } from 'knex';

import { ServerConfig } from './types';
import { Config } from './utils/Config';
import Auth from './auth';
import Users from './users';
import Tenants from './tenants';
import { watchTenantId } from './utils/Event';
import NileDB from './db';

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

    this.db = new NileDB(this.config.db).knex;
    watchTenantId((tenantId) => {
      this.tenantId = tenantId;
    });
  }

  get tenantId(): string | undefined | null {
    return this.config.tenantId;
  }

  set tenantId(tenantId: string | undefined | null) {
    if (tenantId) {
      this.config.tenantId = tenantId;
      this.api.auth.tenantId = tenantId;
      this.api.users.tenantId = tenantId;
      this.api.tenants.tenantId = tenantId;
    }
  }

  get token(): string | undefined {
    return this.config.api.token;
  }

  set token(token: string | undefined) {
    if (token) {
      this.config.api.token = token;
      this.api.auth.api.token = token;
      this.api.users.api.token = token;
      this.api.tenants.api.token = token;
    }
  }
}

export default Server;
