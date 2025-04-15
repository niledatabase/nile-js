import Handlers from './api/handlers';
import { Routes } from './api/types';
import auth from './api/utils/auth';
import { appRoutes } from './api/utils/routes/defaultRoutes';
import Auth, { parseToken, serverLogin } from './auth';
import Tenants from './tenants';
import Users from './users';
import { Config } from './utils/Config';
import Logger from './utils/Logger';
import { setContext as asyncSetContext } from './context/asyncStorage';

export class Api {
  config: Config;
  users: Users;
  auth: Auth;
  tenants: Tenants;
  routes: Routes;
  #headers: undefined | Headers;
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
    this.auth = new Auth(config, undefined, {
      resetHeaders: this.resetHeaders,
    });
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
        `${this.routes.SIGNIN}/{provider}`,
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

  reset = () => {
    this.users = new Users(this.config, this.#headers);
    this.tenants = new Tenants(this.config, this.#headers);
    this.auth = new Auth(this.config, this.#headers, {
      resetHeaders: this.resetHeaders,
    });
  };

  updateConfig = (config: Config) => {
    this.config = config;
    this.handlers = Handlers(this.routes, config);
  };

  resetHeaders = (headers?: Headers) => {
    this.#headers = new Headers(headers ?? {});
    asyncSetContext(new Headers());
    this.reset();
  };

  set headers(headers: Headers | Record<string, string>) {
    const updates: [string, string][] = [];

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        updates.push([key.toLowerCase(), value]);
      });
    } else {
      for (const [key, value] of Object.entries(headers)) {
        updates.push([key.toLowerCase(), value]);
      }
    }

    const merged: Record<string, string> = {};
    this.#headers?.forEach((value, key) => {
      merged[key.toLowerCase()] = value;
    });

    for (const [key, value] of updates) {
      merged[key] = value;
    }

    this.#headers = new Headers();
    for (const [key, value] of Object.entries(merged)) {
      this.#headers.set(key, value);
    }

    this.reset();
  }

  get headers(): Headers | undefined {
    return this.#headers;
  }

  getCookie(req?: Request | Headers) {
    if (req instanceof Headers) {
      return parseToken(req);
    } else if (req instanceof Request) {
      return parseToken(req.headers);
    }
    return null;
  }

  login = async (
    payload: { email: string; password: string },
    config?: { returnResponse?: boolean }
  ) => {
    const [headers, loginRes] = await serverLogin(
      this.config,
      this.handlers
    )(payload);
    this.headers = headers;
    this.setContext(headers);
    if (config?.returnResponse) {
      return loginRes;
    }
    return undefined; // preserve existing behavior where login returns undefined
  };

  session = async (req?: Request | Headers | null | undefined) => {
    if (req instanceof Headers) {
      return this.auth.getSession(req);
    } else if (req instanceof Request) {
      return auth(req, this.config);
    }
    return this.auth.getSession(this.#headers);
  };
  setContext = (req: Request | Headers) => {
    if (req instanceof Headers) {
      asyncSetContext(req);
    } else if (req instanceof Request) {
      asyncSetContext(req.headers);
    }

    const { warn } = Logger(this.config, '[API]');

    if (warn) {
      warn('Set context expects a Request or Header object');
    }
  };
}
