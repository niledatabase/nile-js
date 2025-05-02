import Handlers from '../../api/handlers';
import { handlersWithContext } from '../../api/handlers/withContext';
import { appRoutes } from '../../api/utils/routes/defaultRoutes';
import { Routes } from '../../api/types';
import { LoggerType, NilePoolConfig, ServerConfig } from '../../types';

import {
  EnvConfig,
  // getBasePath,
  getDatabaseName,
  // getDatabaseId,
  getDbHost,
  getDbPort,
  getPassword,
  // getToken,
  getUsername,
  // getSecureCookies,
  // getCallbackUrl,
  // getCookieKey,
} from './envVars';

export class Config {
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
  logger?: LoggerType;
  /**
   * Stores the set tenant id from Server for use in sub classes
   */
  tenantId: string | null | undefined;
  /**
   * Stores the set user id from Server for use in sub classes
   */
  userId: string | null | undefined;

  /**
   * Stores the headers to be used in `fetch` calls
   */
  headers: Headers;

  /**
   * The nile-auth url
   */
  apiUrl: string;

  origin?: string | undefined | null;

  debug?: boolean;
  /**
   * To use secure cookies or not in the fetch
   */
  secureCookies?: boolean;

  callbackUrl?: string;
  /**
   * change the starting route
   */
  routePrefix: string;

  db: NilePoolConfig;

  // api: ApiConfig;

  constructor(config?: ServerConfig, logger?: string) {
    const envVarConfig: EnvConfig = { config, logger };
    const user = getUsername(envVarConfig) as string;
    const password = getPassword(envVarConfig) as string;
    this.routePrefix = config?.routePrefix ?? '/api';
    this.secureCookies = config?.secureCookies;
    this.callbackUrl = config?.callbackUrl;
    this.debug = config?.debug;
    this.origin = config?.origin ?? 'http://localhost:3000';

    if (config?.headers) {
      this.headers = config?.headers as Headers;
    } else {
      this.headers = new Headers();
    }

    // we need these 4 values no matter what, so break if they are missing
    // we support getting user and password from the postgres url (so technically you can configure in 2 env vars)
    if (process.env.NODE_ENV !== 'TEST') {
      if (!process.env.NILEDB_API_URL) {
        throw new Error(
          'A connection to nile-auth is required. Set NILEDB_API_URL as an environment variable.'
        );
      }

      if (!process.env.NILEDB_POSTGRES_URL) {
        throw new Error(
          'A nile database required. Set NILEDB_POSTGRES_URL as an environment variable.'
        );
      }

      if (!user) {
        throw new Error(
          'A database user is required. Set NILEDB_USER as an environment variable.'
        );
      }

      if (!password) {
        throw new Error(
          'A database password is required. Set NILEDB_PASSWORD as an environment variable.'
        );
      }
    }

    this.routes = {
      ...appRoutes(config?.routePrefix),
      ...config?.routes,
    };

    this.handlers = Handlers(this.routes as Routes, this);
    this.handlersWithContext = handlersWithContext(this.routes, this);

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
    this.tenantId = config?.tenantId;
    this.userId = config?.userId;
    this.logger = config?.logger;

    const databaseName = getDatabaseName(envVarConfig) as string;

    this.apiUrl = process.env.NILEDB_API_URL as string;

    const { host, port, ...dbConfig } = config?.db ?? {};
    const configuredHost = host ?? getDbHost(envVarConfig);
    const configuredPort = port ?? getDbPort(envVarConfig);

    this.db = {
      user,
      password,
      host: configuredHost,
      port: configuredPort,
      ...dbConfig,
    };
    if (databaseName) {
      this.db.database = databaseName;
    }
  }
}
