import Handlers from './api/handlers';
import { Routes } from './api/types';
import { appRoutes } from './api/utils/routes/defaultRoutes';
import serverAuth from './auth';
import Tenants from './tenants';
import Users from './users';
import { Config } from './utils/Config';

export class Api {
  config: Config;
  users: Users;
  tenants: Tenants;
  routes: Routes;
  handlers: {
    GET: (req: Request) => Promise<void | Response>;
    POST: (req: Request) => Promise<void | Response>;
    DELETE: (req: Request) => Promise<void | Response>;
    PUT: (req: Request) => Promise<void | Response>;
  };
  constructor(config: Config) {
    this.config = config;
    this.users = new Users(config);
    this.tenants = new Tenants(config);
    this.routes = {
      ...appRoutes(config?.routePrefix),
      ...config?.routes,
    };
    this.handlers = Handlers(this.routes, config);
  }

  updateConfig(config: Config) {
    this.config = config;
    this.handlers = Handlers(this.routes, config);
  }

  set headers(headers: Headers) {
    this.users = new Users(this.config, headers);
    this.tenants = new Tenants(this.config, headers);
  }
  async login(payload: { email: string; password: string }) {
    this.headers = await serverAuth(this.config, this.handlers)(payload);
  }
}
