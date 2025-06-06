import Handlers from '../../api/handlers';
import { appRoutes } from '../../api/utils/routes';
import { Routes } from '../../api/types';
import { LoggerType, NilePoolConfig, NileConfig, Extension } from '../../types';
import Logger from '../Logger';

type ExtensionCtx = {
  handleOnRequest: (
    config: Config,
    _init: RequestInit & { request: Request },
    params: RequestInit
  ) => Promise<void>;
};
type ConfigConstructor = NileConfig & { extensionCtx?: ExtensionCtx };
import {
  EnvConfig,
  getDatabaseName,
  getDbHost,
  getDbPort,
  getPassword,
  getUsername,
  getSecureCookies,
  getCallbackUrl,
  getApiUrl,
} from './envVars';

export class Config {
  routes: Routes;
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
  extensionCtx: ExtensionCtx;
  extensions?: Extension[];
  logger: LoggerType;
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

  /**
   * important for separating the `origin` config value from a default in order to make requests
   */
  serverOrigin: string;

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

  constructor(config?: ConfigConstructor) {
    this.routePrefix = config?.routePrefix ?? '/api';
    this.debug = config?.debug;
    this.origin = config?.origin;
    this.extensions = config?.extensions;
    this.extensionCtx = config?.extensionCtx as ExtensionCtx;
    this.serverOrigin = config?.origin ?? 'http://localhost:3000';

    this.logger = config?.logger ?? Logger(this);
    const envVarConfig: EnvConfig = {
      config: { ...config, logger: this.logger },
    };
    this.secureCookies = getSecureCookies(envVarConfig);
    this.callbackUrl = getCallbackUrl(envVarConfig);

    // this four throw because its the only way to get it
    this.apiUrl = getApiUrl(envVarConfig) as string;
    const user = getUsername(envVarConfig) as string;
    const password = getPassword(envVarConfig) as string;
    const databaseName = getDatabaseName(envVarConfig) as string;

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

    // we need these values no matter what, so break if they are missing

    if (config?.headers) {
      this.headers = config?.headers as Headers;
    } else {
      this.headers = new Headers();
    }

    this.routes = {
      ...appRoutes(config?.routePrefix),
      ...config?.routes,
    };

    this.handlers = Handlers(this.routes as Routes, this);
    // this.handlersWithContext = handlersWithContext(this.routes, this);

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
  }
}
