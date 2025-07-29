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
import { HEADER_ORIGIN, HEADER_SECURE_COOKIES } from './utils/constants';
import { handlersWithContext } from './api/handlers/withContext';
import { buildExtensionConfig } from './api/utils/extensions';
import {
  ctx,
  defaultContext,
  withNileContext,
} from './api/utils/request-context';
import { getTenantId } from './utils/Config/envVars';

export class Server {
  users: Users;
  tenants: Tenants;
  auth: Auth;
  #config: Config;
  #handlers: NileHandlers;
  #manager: DbManager;

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
        // internally we can call this for sign in, among other things. Be sure the next request still works.
        this.#config.context.headers = new Headers(headers);
        // this is always true when called internally
        this.#config.context.preserveHeaders = true;
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
    this.#config.context = { ...this.getContext() };
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

  /** Allows setting of context outside of the request lifecycle
   * Basically means you want to disregard cookies and do everything manually
   * If we elect to DDL, we don't want to use tenant id or user id, so remove those.
   */
  async withContext(context?: PartialContext): Promise<this>;
  async withContext<T>(
    context: PartialContext,
    fn: (sdk: this) => Promise<T>
  ): Promise<T>;
  async withContext<T>(
    context?: PartialContext,
    fn?: (sdk: this) => Promise<T>
  ): Promise<T | this> {
    const { ...initialContext } = (context ?? defaultContext) as PartialContext;
    this.#config.context = { ...initialContext };
    // optimize for subsequent calls based on that last used context. Internally, extensions should be overriding this global-ish context anyway
    const preserve =
      (context && 'preserveHeaders' in context && context.preserveHeaders) ??
      true;

    if (preserve) {
      this.#config.context = { ...this.getContext(), ...context };
    }
    return withNileContext(this.#config, async () => {
      if (fn) {
        return fn(this);
      }
      return this;
    });
  }

  /**
   * Creates a context without a user id and a tenant id, but keeps the headers around for auth at least.
   */
  async noContext(): Promise<this>;
  async noContext<T>(fn: (sdk: this) => Promise<T>): Promise<T>;
  async noContext<T>(fn?: (sdk: this) => Promise<T>): Promise<T | this> {
    this.#config.context.tenantId = undefined;
    this.#config.context.userId = undefined;

    return withNileContext(this.#config, async () => {
      // there are some cases where you need to "override" stuff, and the extension context
      // is going to keep adding it back. For instance, nextjs is always going to set a tenant_id from the cookie
      // we need to honor the incoming config over the extension, else you can never just "call" things.
      ctx.set({ userId: undefined, tenantId: undefined });

      if (fn) {
        return fn(this);
      }
      return this;
    });
  }
  /**
   *
   * @returns the last used (basically global) context object, useful for debugging or making your own context
   */
  getContext(): Context {
    return ctx.getLastUsed();
  }

  /**
   * Merge headers together
   * Saves them in a singleton for use in a request later. It's basically the "default" value
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
  }

  /**
   * Allow some internal mutations to reset our config + headers
   */
  #reset = () => {
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
