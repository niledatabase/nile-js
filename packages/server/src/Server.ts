import pg from 'pg';

import { NileConfig } from './types';
import { Config } from './utils/Config';
import { watchHeaders, watchTenantId, watchUserId } from './utils/Event';
import DbManager from './db';
import Users from './users';
import Tenants from './tenants';
import Auth from './auth';
import { getTenantId } from './utils/Config/envVars';
import Logger from './utils/Logger';
import { HEADER_ORIGIN, HEADER_SECURE_COOKIES } from './utils/constants';
import {
  CTXHandlerType,
  handlersWithContext,
} from './api/handlers/withContext';
import { getTenantFromHttp } from './utils/fetch';
import { buildExtensionConfig } from './api/utils/extensions';

export class Server {
  users: Users;
  tenants: Tenants;
  auth: Auth;
  #config: Config;
  #handlers: {
    GET: (req: Request) => Promise<void | Response>;
    POST: (req: Request) => Promise<void | Response>;
    DELETE: (req: Request) => Promise<void | Response>;
    PUT: (req: Request) => Promise<void | Response>;
    withContext: CTXHandlerType;
  };
  #paths: {
    get: string[];
    post: string[];
    delete: string[];
    put: string[];
  };
  #manager: DbManager;
  #headers: undefined | Headers;

  constructor(config?: NileConfig) {
    this.#config = new Config({
      ...config,
      extensionCtx: buildExtensionConfig(this),
    });
    // watch first, they may mutate first
    watchTenantId((tenantId) => {
      if (tenantId !== this.#config.tenantId) {
        this.#config.tenantId = tenantId;
        this.#reset();
      }
    });

    watchUserId((userId) => {
      if (userId !== this.#config.userId) {
        this.#config.userId = userId;
        this.#reset();
      }
    });

    watchHeaders((headers) => {
      this.setContext(headers);
      this.#reset();
    });

    this.#handlers = {
      ...this.#config.handlers,
      withContext: handlersWithContext(this.#config),
    };

    this.#paths = this.#config.paths;

    this.#config.tenantId = getTenantId({ config: this.#config });
    this.#manager = new DbManager(this.#config);

    // headers first, so instantiation is right the first time
    this.#handleHeaders(config);

    this.users = new Users(this.#config);
    this.tenants = new Tenants(this.#config);
    this.auth = new Auth(this.#config);
  }

  get db(): pg.Pool & { clearConnections: () => void } {
    const pool = this.#manager.getConnection(this.#config);

    return Object.assign(pool, {
      clearConnections: () => {
        this.#manager.clear(this.#config);
      },
    });
  }

  /**
   * A convenience function that applies a config and ensures whatever was passed is set properly
   */

  getInstance<T = Request | Headers | Record<string, string>>(
    config: NileConfig,
    req?: T
  ): Server {
    const _config = { ...this.#config, ...config };

    // be sure the config is up to date
    const updatedConfig = new Config(_config);
    this.#config = new Config(updatedConfig);
    // propagate special config items
    this.#config.tenantId = config.tenantId;
    this.#config.userId = config.userId;

    if (req) {
      this.setContext(req);
    }

    this.#reset();

    return this;
  }
  getPaths() {
    return this.#paths;
  }

  get handlers() {
    return this.#handlers;
  }
  /**
   * Allow the setting of headers from a req or header object.
   * Makes it possible to handle REST requests easily
   * Also makes it easy to set user + tenant in some way
   * @param req
   * @returns undefined
   */
  setContext(
    req:
      | Request
      | Headers
      | Record<string, string>
      | unknown
      | { tenantId?: string; userId?: string }
  ) {
    try {
      if (req instanceof Headers) {
        this.#handleHeaders(req);
        this.#reset();
        return;
      } else if (req instanceof Request) {
        this.#handleHeaders(new Headers(req.headers));
        this.#reset();

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
      this.#config.tenantId = req.tenantId as string | undefined;
    }
    if (req && typeof req === 'object' && 'userId' in req) {
      ok = true;
      this.#config.userId = req.userId as string | undefined;
    }

    if (ok) {
      return;
    }
    /**
     * in some cases (like express) an object is sent
     * tenantId and userId is also an object, so do that one first
     * We bail out of this execution if that is set, since you can't really do both
     */

    if (typeof req === 'object') {
      const headers = new Headers(req as Record<string, string>);
      if (headers) {
        this.#handleHeaders(headers);
        this.#reset();

        return;
      }
    }
    const { warn } = Logger(this.#config, '[API]');

    if (warn) {
      warn(
        'Set context expects a Request, Header instance or an object of Record<string, string>'
      );
    }
  }

  getContext() {
    return {
      headers: this.#headers,
      userId: this.#config.userId,
      tenantId: this.#config.tenantId,
    };
  }

  /**
   * Merge headers together
   * Internally, passed a NileConfig, externally, should be using Headers
   */
  #handleHeaders(
    config?: NileConfig | void | Headers | Record<string, string> | null
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
        this.#headers.set(HEADER_ORIGIN, config.origin);
      }
      if (config && config.secureCookies != null) {
        this.#headers.set(HEADER_SECURE_COOKIES, String(config.secureCookies));
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

    // if we do have a cookie, grab anything useful before it is destroyed.
    this.#config.tenantId = getTenantFromHttp(this.#headers, this.#config);

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

    this.#config.headers = this.#headers;
  }

  /**
   * Allow some internal mutations to reset our config + headers
   */
  #reset = () => {
    this.#config.headers = this.#headers ?? new Headers();
    this.users = new Users(this.#config);
    this.tenants = new Tenants(this.#config);
    this.auth = new Auth(this.#config);
  };
}

let server: Server;
export function create(config?: NileConfig): Server {
  if (!server) {
    server = new Server(config);
  }

  return server;
}
