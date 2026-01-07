import Handlers from '../../api/handlers';
import { appRoutes } from '../../api/utils/routes';
import { Routes } from '../../api/types';
import {
  NilePoolConfig,
  NileConfig,
  Extension,
  ExtensionState,
  RouteFunctions,
  PartialContext,
} from '../../types';
import Logger, { LogReturn } from '../Logger';

export type ConfigurablePaths = {
  get: string[];
  post: string[];
  delete: string[];
  put: string[];
};
export type ExtensionReturns = void | Response | Request | ExtensionState;
export type ExtensionCtx = {
  runExtensions: <T = ExtensionReturns>(
    toRun: ExtensionState,
    config: Config,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any,
    _init?: RequestInit & { request: Request }
  ) => Promise<T>;
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
  handlers: RouteFunctions;
  paths: ConfigurablePaths;
  extensionCtx: ExtensionCtx;
  extensions?: Extension[];
  logger: LogReturn;
  context: PartialContext;

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

  /**
   * Skip setting the host header in the request.
   */
  skipHostHeader?: boolean;

  db: NilePoolConfig;

  constructor(config?: ConfigConstructor) {
    this.routePrefix = config?.routePrefix ?? '/api';
    this.debug = config?.debug;
    this.origin = config?.origin;
    this.extensions = config?.extensions;
    this.skipHostHeader = config?.skipHostHeader;
    this.extensionCtx = config?.extensionCtx as ExtensionCtx;
    this.serverOrigin = config?.origin ?? 'http://localhost:3000';

    this.logger = Logger(config);
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

    // If you configured nile globally, we keep these to be sure they are honored per-request
    this.context = {
      tenantId: config?.tenantId,
      userId: config?.userId,
      headers: config?.headers ? new Headers(config.headers) : new Headers(),
    };

    this.routes = {
      ...appRoutes(config?.routePrefix),
      ...config?.routes,
    };

    this.handlers = Handlers(this.routes as Routes, this);

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
}
