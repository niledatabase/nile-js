import pg from 'pg';

import { ServerConfig } from './types';
import { Config } from './utils/Config';
import { watchHeaders, watchTenantId, watchUserId } from './utils/Event';
import DbManager from './db';
import Users from './users';
import Tenants from './tenants';
import Auth from './auth';
import { getTenantId } from './utils/Config/envVars';
import Logger from './utils/Logger';
import { Routes } from './api/types';
import { X_NILE_ORIGIN, X_NILE_SECURECOOKIES } from './utils/constants';

export class Server {
  config: Config;
  users: Users;
  tenants: Tenants;
  auth: Auth;
  debug: boolean;
  routes: Routes;
  handlersWithContext;
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

  #userId: string | undefined | null;
  #tenantId: string | undefined | null;
  #manager: DbManager;
  #headers: undefined | Headers;

  constructor(config?: ServerConfig) {
    this.config = new Config(config, '[initial config]');

    this.routes = this.config.routes;
    this.handlersWithContext = this.config.handlersWithContext;
    this.handlers = this.config.handlers;
    this.paths = this.config.paths;

    this.#tenantId = getTenantId({ config: this.config });
    this.#manager = new DbManager(this.config);

    // headers first, so instantiation is right the first time
    this.#handleHeaders(config);

    this.users = new Users(this.config);
    this.tenants = new Tenants(this.config);
    this.auth = new Auth(this.config);

    this.debug = Boolean(config?.debug);

    watchTenantId((tenantId) => {
      this.tenantId = tenantId;
    });

    watchUserId((userId) => {
      this.userId = userId;
    });

    watchHeaders((headers) => {
      this.setContext(headers);
    });
  }

  /**
   * The currently set user id (set at signIn, at least)
   */
  get userId(): string | undefined | null {
    return this.#userId;
  }

  /**
   * Set the user id (in the config)
   */
  set userId(userId: string | undefined | null) {
    if (userId !== this.#userId) {
      this.#userId = userId;
      this.#reset();
    }
  }

  get tenantId(): string | undefined | null {
    return this.#tenantId;
  }

  set tenantId(tenantId: string | undefined | null) {
    if (this.tenantId !== this.#tenantId) {
      this.#tenantId = tenantId;
      this.#reset();
    }
  }

  get db(): pg.Pool {
    return this.#manager.getConnection(this.config);
  }

  clearConnections() {
    this.#manager.clear(this.config);
  }

  /**
   * A convenience function that applies a config and ensures whatever was passed is set properly
   */

  getInstance<T = Request | Headers | Record<string, string>>(
    config: ServerConfig,
    req?: T
  ): Server {
    const _config = { ...this.config, ...config };

    // be sure the config is up to date
    const updatedConfig = new Config(_config);
    this.config = new Config(updatedConfig);
    // propagate special config items
    this.#tenantId = config.tenantId;
    this.#userId = config.userId;

    if (req) {
      this.setContext(req);
    }

    this.#reset();

    return this;
  }
  /**
   * Allow the setting of headers from a req or header object.
   * Makes it possible to handle REST requests easily
   * Also makes it easy to set user + tenant in some wa
   * @param req
   * @returns undefined
   */
  setContext = (
    req:
      | Request
      | Headers
      | Record<string, string>
      | unknown
      | { tenantId?: string; userId?: string }
  ) => {
    try {
      if (req instanceof Headers) {
        this.headers = req;
        return;
      } else if (req instanceof Request) {
        this.headers = new Headers(req.headers);
        return;
      }
      const headers = new Headers(req as Record<string, string>);
      if (headers) {
        this.headers = headers;
        return;
      }
    } catch {
      //noop
    }
    // we also support setting context in 1 go via tenantId and userId
    // this is a little less good because auth is going to mess with this
    // logically, not technically.
    let ok = false;
    if (req && typeof req === 'object' && 'tenantId' in req) {
      ok = true;
      this.#tenantId = req.tenantId as string | undefined;
    }
    if (req && typeof req === 'object' && 'userId' in req) {
      ok = true;
      this.#userId = req.userId as string | undefined;
    }

    if (ok) {
      return;
    }
    const { warn } = Logger(this.config, '[API]');

    if (warn) {
      warn(
        'Set context expects a Request, Header instance or an object of Record<string, string>'
      );
    }
  };

  /**
   * Merges the current and new headers together.
   * If this is used, a `cookie` key must exist in the headers, else request will be unauthorized
   */
  set headers(headers: void | Headers | Record<string, string>) {
    this.#handleHeaders(headers);
    this.#reset();
  }

  get headers(): Headers {
    if (this.#headers instanceof Headers) {
      return this.#headers;
    }
    return new Headers(this.#headers);
  }
  /**
   * Merge headers together
   * Internally, passed a ServerConfig, externally, should be using Headers
   */
  #handleHeaders(
    config?: ServerConfig | void | Headers | Record<string, string> | null
  ) {
    const updates: [string, string][] = [];
    let headers;
    this.#headers = new Headers();

    if (config instanceof Headers) {
      headers = config;
    } else if (config?.headers) {
      // handle a config object internally,
      headers = config?.headers;
      if (config && config.origin) {
        // DO SOMETHING TO SURFACE A WARNING?
        this.#headers.set(X_NILE_ORIGIN, config.origin);
      }
      if (config && config.secureCookies != null) {
        this.#headers.set(X_NILE_SECURECOOKIES, String(config.secureCookies));
      }
    }

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        updates.push([key.toLowerCase(), value]);
      });
    } else {
      for (const [key, value] of Object.entries(headers ?? {})) {
        updates.push([key.toLowerCase(), value]);
      }
    }

    const merged: Record<string, string> = {};
    this.#headers?.forEach((value, key) => {
      // It is expected that if the 'cookie' is missing when you set headers, it should be removed.
      if (key.toLowerCase() !== 'cookie') {
        merged[key.toLowerCase()] = value;
      }
    });

    for (const [key, value] of updates) {
      merged[key] = value;
    }

    for (const [key, value] of Object.entries(merged)) {
      this.#headers.set(key, value);
    }

    this.config.headers = this.#headers;
  }

  /**
   * Allow some internal mutations to reset our config + headers
   */
  #reset = () => {
    this.config.headers = this.#headers ?? new Headers();
    this.users = new Users(this.config);
    this.tenants = new Tenants(this.config);
    this.auth = new Auth(this.config);
  };
}

let server: Server;
export function create(config?: ServerConfig): Server {
  if (!server) {
    server = new Server(config);
  }

  return server;
}
