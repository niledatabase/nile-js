import pg, { Pool } from 'pg';

import {
  Context,
  Extension,
  ExtensionState,
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
        this.#reset();
      }
    });

    this.#handlers = {
      ...this.#config.handlers,
      withContext: handlersWithContext(this.#config),
    };

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
        const ext = create();
        // we can only run this after config has a value, so we must wait, but we can't.
        if (typeof ext.onConfigure === 'function') {
          this.#config.logger('[EXTENSION]').debug(`configuring for ${ext.id}`);

          ext.onConfigure(this);
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

  /**
   * Query the database with the current context
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Pool['query'] = (queryStream: any, values?: any) => {
    this.#config.context = { ...this.getContext() };
    const pool = this.#manager.getConnection(this.#config);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return pool.query(queryStream as any, values);
  };

  /**
   * Return a db object that can be used to talk to the database
   * Does not have a context by default
   */
  get db(): pg.Pool & { clearConnections: () => void } {
    const pool = this.#manager.getConnection(this.#config, true);

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

        const resolved = this.#config.extensions.map((ext) => ext());
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
   * Sets the context for a particular set of requests or db calls to be sure the context is fully managed for the entire lifecycle
   */
  async withContext(): Promise<this>;
  async withContext<T>(
    context: PartialContext,
    fn: AsyncCallback<this, T>
  ): Promise<T>;
  async withContext(context: PartialContext): Promise<this>;
  async withContext<T>(fn: AsyncCallback<this, T>): Promise<T>;
  async withContext<T>(
    contextOrFn?: PartialContext | AsyncCallback<this, T>,
    maybeFn?: AsyncCallback<this, T>
  ): Promise<T | this> {
    const isFn = typeof contextOrFn === 'function';

    const context = isFn ? {} : contextOrFn ?? {};
    const fn = isFn ? (contextOrFn as AsyncCallback<this, T>) : maybeFn;

    const preserve =
      'useLastContext' in context ? context.useLastContext : true;

    let hydrated: Context | undefined;
    if (preserve) {
      hydrated = await this.#hydrateContextFromExtensions();
      const base = hydrated ?? this.#config.context;
      this.#config.context = { ...base, ...context };
    } else {
      this.#config.context = { ...defaultContext, ...context };
    }
    return withNileContext(this.#config, async () => {
      return fn ? fn(this) : this;
    });
  }

  /**
   * Creates a context without a user id and a tenant id, but keeps the headers around for auth at least.
   * This is useful for DDL/DML, since most extensions will set the context by default
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

  async #hydrateContextFromExtensions(): Promise<Context | undefined> {
    if (!this.#config.extensions || this.#config.extensions.length === 0) {
      return undefined;
    }

    let updated: Context | undefined;

    await ctx.run({}, async () => {
      await this.#config.extensionCtx?.runExtensions(
        ExtensionState.withContext,
        this.#config
      );
      updated = ctx.get();
    });

    if (!updated) {
      return undefined;
    }

    const hydrated: Context = {
      headers: new Headers(updated.headers),
      tenantId: updated.tenantId,
      userId: updated.userId,
    };

    this.#config.context.headers = new Headers(hydrated.headers);
    this.#config.context.tenantId = hydrated.tenantId;
    this.#config.context.userId = hydrated.userId;

    return hydrated;
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
type AsyncCallback<TInstance, TResult> = (sdk: TInstance) => Promise<TResult>;
