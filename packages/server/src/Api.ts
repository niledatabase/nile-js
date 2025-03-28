import Handlers from './api/handlers';
import { Routes } from './api/types';
import auth from './api/utils/auth';
import { appRoutes } from './api/utils/routes/defaultRoutes';
import Auth, { serverLogin } from './auth';
import Tenants from './tenants';
import Users from './users';
import { Config } from './utils/Config';

export class Api {
  config: Config;
  users: Users;
  auth: Auth;
  tenants: Tenants;
  routes: Routes;
  _headers: undefined | Headers;
  handlers: {
    GET: (req: Request) => Promise<void | Response>;
    POST: (req: Request) => Promise<void | Response>;
    DELETE: (req: Request) => Promise<void | Response>;
    PUT: (req: Request) => Promise<void | Response>;
  };
  paths: {
    get: string[];
    post: string[];
    delete: string[];
    put: string[];
  };
  constructor(config: Config) {
    this.config = config;
    this.auth = new Auth(config);
    this.users = new Users(config);
    this.tenants = new Tenants(config);
    this.routes = {
      ...appRoutes(config?.api.routePrefix),
      ...config?.api.routes,
    };
    this.handlers = Handlers(this.routes, config);
    this.paths = {
      get: [
        this.routes.ME,
        this.routes.TENANT_USERS,
        this.routes.TENANTS,
        this.routes.TENANT,
        this.routes.SESSION,
        this.routes.SIGNIN,
        this.routes.PROVIDERS,
        this.routes.CSRF,
        this.routes.PASSWORD_RESET,
        this.routes.CALLBACK,
        this.routes.SIGNOUT,
        this.routes.VERIFY_REQUEST,
        this.routes.ERROR,
      ],
      post: [
        this.routes.TENANT_USERS,
        this.routes.SIGNUP,
        this.routes.USERS,
        this.routes.TENANTS,
        this.routes.SESSION,
        this.routes.SIGNIN,
        this.routes.PASSWORD_RESET,
        this.routes.PROVIDERS,
        this.routes.CSRF,
        `${this.routes.CALLBACK}/{provider}`,
        this.routes.SIGNOUT,
      ],
      put: [
        this.routes.TENANT_USERS,
        this.routes.USERS,
        this.routes.TENANT,
        this.routes.PASSWORD_RESET,
      ],
      delete: [this.routes.TENANT_USER, this.routes.TENANT],
    };
  }

  updateConfig(config: Config) {
    this.config = config;
    this.handlers = Handlers(this.routes, config);
  }

  set headers(headers: Headers) {
    this.users = new Users(this.config, headers);
    this.tenants = new Tenants(this.config, headers);
    this.auth = new Auth(this.config, headers);
    this._headers = headers;
  }

  async login(payload: { email: string; password: string }) {
    this.headers = await serverLogin(this.config, this.handlers)(payload);
  }

  async session(req?: Request | Headers | null | undefined) {
    if (req instanceof Headers) {
      return this.auth.getSession(req);
    } else if (req instanceof Request) {
      return auth(req, this.config);
    }
    return this.auth.getSession(this._headers);
  }
}
