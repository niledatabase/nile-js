import pg from 'pg';

import {
  Context,
  Extension,
  NileConfig,
  NileHandlers,
  PartialContext,
} from './types';
import { Config, ConfigurablePaths } from './utils/Config';
import { watchHeaders, watchTenantId, watchUserId } from './utils/Event';
import DbManager from './db';
import Users from './users';
import Tenants from './tenants';
import Auth from './auth';
import Logger from './utils/Logger';
import { HEADER_ORIGIN, HEADER_SECURE_COOKIES } from './utils/constants';
import { handlersWithContext } from './api/handlers/withContext';
import { buildExtensionConfig } from './api/utils/extensions';
import { ctx, withNileContext } from './api/utils/request-context';
import { getTenantId } from './utils/Config/envVars';

export class Server {
  users: Users;
  tenants: Tenants;
  auth: Auth;
  #config: Config;
  #handlers: NileHandlers;
  #manager: DbManager;
  // #headers: undefined | Headers;
  // #preserveHeaders: boolean;

  constructor(config?: NileConfig) {
    this.#config = new Config({
      ...config,
      extensionCtx: buildExtensionConfig(this),
    });

    // watch first, they may mutate first
    // unsure if this is still useful, with `ctx` around
    watchTenantId((tenantId) => {
      if (tenantId !== this.#config.context.tenantId) {
        this.#config.context.tenantId = String(tenantId);
        this.#reset();
      }
    });

    watchUserId((userId) => {
      if (userId !== this.#config.context.userId) {
        this.#config.context.userId = String(userId);
        this.#reset();
      }
    });

    watchHeaders((headers) => {
      if (headers) {
        this.#config.context.headers = new Headers(headers);
        // this.setContext(headers);
        this.#reset();
      }
    });

    this.#handlers = {
      ...this.#config.handlers,
      withContext: handlersWithContext(this.#config),
    };

    this.#config.context.preserveHeaders = config?.preserveHeaders ?? false;

    this.#config.context.tenantId = getTenantId({ config: this.#config });

    this.#manager = new DbManager(this.#config);

    // headers first, so instantiation is right the first time
    this.#handleHeaders(config);

    this.users = new Users(this.#config);
    this.tenants = new Tenants(this.#config);
    this.auth = new Auth(this.#config);

    // for `onConfigure`, we run it, but after the full config is already made
    if (config?.extensions) {
      for (const create of config.extensions) {
        if (typeof create !== 'function') {
          continue;
        }
        const ext = create(this);
        // we can only run this after config has a value, so we must wait, but we can't.
        if (ext.onConfigure) {
          ext.onConfigure();
        }

        if (ext?.replace?.handlers) {
          this.#config
            .logger('[EXTENSION]')
            .debug(`${ext.id} replacing handlers`);
          // if you replace these handlers, you can't call the original ones, so we need to "replace" our headers within the request.
          this.#handlers = ext.replace.handlers({
            ...this.#config.handlers,
            withContext: handlersWithContext(this.#config),
          });
        }
      }
    }
  }

  get db(): pg.Pool & { clearConnections: () => void } {
    const pool = this.#manager.getConnection(this.#config);

    return Object.assign(pool, {
      clearConnections: () => {
        this.#manager.clear(this.#config);
      },
    });
  }
  get logger() {
    return this.#config.logger;
  }

  get extensions() {
    return {
      remove: async (id: string) => {
        if (!this.#config.extensions) return;

        const resolved = this.#config.extensions.map((ext) => ext(this));
        const index = resolved.findIndex((ext) => ext.id === id);
        if (index !== -1) {
          this.#config.extensions.splice(index, 1);
        }
        return resolved;
      },
      add: (extension: Extension) => {
        if (!this.#config.extensions) {
          this.#config.extensions = [];
        }
        this.#config.extensions.push(extension);
      },
    };
  }

  get handlers() {
    return this.#handlers;
  }

  get paths(): ConfigurablePaths {
    return this.#config.paths;
  }

  set paths(paths: ConfigurablePaths) {
    this.#config.paths = paths;
  }

  /**
   * Allow the setting of headers from a req or header object.
   * Makes it possible to handle REST requests easily
   * Also makes it easy to set user + tenant in some way
   * This is a global configuration, so you can run into concurrency problems.
   * Use extensions to handle per-request configuration (vs this being *mostly* global)
   *
   * I don't think anyone should do this any more? the context is in the container, so this would only be for internal things to
   * set the "initial", to persist back... but it seems like you should just `withContext` anyway?
   * maybe not, since you could do 1 then the other back to back in a "different" context.
   *
   * @param req
   * @returns undefined
   */
  #setContext = (
    req:
      | Request
      | Headers
      | Record<string, string>
      | unknown
      | { tenantId?: string; userId?: string },
    ...remaining: unknown[]
  ) => {
    // we also support setting context in 1 go via tenantId and userId
    // this is a little less good because auth is going to mess with this
    // logically, not technically.
    let ok = false;
    if (req && typeof req === 'object' && 'tenantId' in req) {
      ok = true;
      // this.#config.tenantId = req.tenantId as string | undefined;
    }
    if (req && typeof req === 'object' && 'userId' in req) {
      ok = true;
      // this.#config.userId = req.userId as string | undefined;
    }

    if (req && typeof req === 'object' && 'preserveHeaders' in req) {
      ok = true;
      this.#config.context.preserveHeaders = Boolean(req.preserveHeaders);
    }

    let atLeastOne = false;
    // run the extensions next. this basically means "extensions know better"
    // so we are going to trust the developer to handle the next round trip,
    // which may stop at a previous cycle. We also assume they are handling the
    // `instance` setContext as well.
    if (this.#config?.extensions) {
      for (const create of this.#config.extensions) {
        if (typeof create !== 'function') {
          continue;
        }
        const ext = create(this);
        // we can only run this after config has a value, so we must wait, but we can't.
        if (typeof ext.onSetContext === 'function') {
          if (req) {
            ext.onSetContext(req, ...remaining);
            atLeastOne = true;
          } else {
            this.#config
              .logger('extension')
              .warn('attempted to call onSetContext without a value');
          }
        }
      }
    }
    // any extension that uses `onSetContext` knows better than the default.
    // if you need default behavior, remove the extension and call the function again
    if (atLeastOne) {
      return;
    }

    // the "default" behavior. Headers or req, we know what to do.
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

    /**
     * when an object is sent
     * tenantId and userId is also an object, which is done first
     * if that is the case, we should have exited if we parsed from `req` and `req.headers`
     * if none of that is true, we're going to convert the req to Header, and maybe fail
     */
    if (ok) {
      return;
    }

    if (typeof req === 'object') {
      try {
        const headers = new Headers(req as Record<string, string>);
        if (headers) {
          this.#handleHeaders(headers);
          this.#reset();

          return;
        }
      } catch {
        // this one didn't work either
      }
    }

    const { warn } = Logger(this.#config)('[API]');

    if (warn) {
      warn(
        'Set context expects a Request, Header instance or an object of Record<string, string>'
      );
    }
  };
  /** Allows setting of context outside of the request lifecycle
   * Basically means you want to disregard cookies and do everything manually
   */
  async withContext(config: PartialContext): Promise<this>;
  async withContext<T>(
    config: PartialContext,
    fn: (sdk: this) => Promise<T>
  ): Promise<T>;
  async withContext<T>(
    config: PartialContext,
    fn?: (sdk: this) => Promise<T>
  ): Promise<T | this> {
    this.#config.context = config;
    // optimize for subsequent calls based on that last used context. Internally, extensions should be overriding this global-ish context anyway
    const preserve =
      ('preserveHeaders' in config && config.preserveHeaders) ?? true;
    if (preserve) {
      this.#config.context = { ...this.getContext(), ...config };
    }
    return withNileContext(this.#config, async () => {
      if (fn) {
        return fn(this);
      }
      return this;
    });
  }
  /**
   *
   * @returns the last used (basically global) context object
   */
  getContext(): Context {
    return ctx.getLastUsed();
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
    this.#config.context.headers = new Headers();

    if (config instanceof Headers) {
      headers = config;
    } else if (config?.headers) {
      // handle a config object internally,
      headers = config?.headers;
      if (config && config.origin) {
        // DO SOMETHING TO SURFACE A WARNING?
        this.#config.context.headers.set(HEADER_ORIGIN, config.origin);
      }
      if (config && config.secureCookies != null) {
        this.#config.context.headers.set(
          HEADER_SECURE_COOKIES,
          String(config.secureCookies)
        );
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
    // this.#config.tenantId = getTenantFromHttp(this.#headers, this.#config);

    this.#config.context.headers?.forEach((value, key) => {
      // It is expected that if the 'cookie' is missing when you set headers, it should be removed.
      if (key.toLowerCase() !== 'cookie') {
        merged[key.toLowerCase()] = value;
      }
    });

    for (const [key, value] of updates) {
      merged[key] = value;
    }

    for (const [key, value] of Object.entries(merged)) {
      this.#config.context.headers.set(key, value);
    }

    this.#config.logger('[handleHeaders]').debug(JSON.stringify(merged));
    // this.#config.headers = this.#headers;
  }

  /**
   * Allow some internal mutations to reset our config + headers
   */
  #reset = () => {
    // this.#config.headers = this.#headers ?? new Headers();
    this.#config.extensionCtx = buildExtensionConfig(this);
    this.users = new Users(this.#config);
    this.tenants = new Tenants(this.#config);
    this.auth = new Auth(this.#config);
  };
}

let server: unknown;
export function create<T = Server>(config?: NileConfig): T {
  if (!server) {
    server = new Server(config) as T;
  }

  return server as T;
}
