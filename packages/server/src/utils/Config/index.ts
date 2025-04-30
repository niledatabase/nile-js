import { Routes } from '../../api/types';
import { LoggerType, NilePoolConfig, ServerConfig } from '../../types';

import {
  EnvConfig,
  getBasePath,
  getDatabaseName,
  getDatabaseId,
  getDbHost,
  getDbPort,
  getPassword,
  getTenantId,
  getToken,
  getUsername,
  getSecureCookies,
  getCallbackUrl,
  getCookieKey,
} from './envVars';

export type ApiParams = {
  basePath?: string | undefined;
  cookieKey?: string;
  token?: string | undefined;
  callbackUrl?: string | undefined;
  routes?: Partial<Routes>;
  routePrefix?: string | undefined;
  secureCookies?: boolean;
  // the origin for the requests. Allows the setting of the callback origin to a random FE (eg FE localhost:3001 -> BE: localhost:5432 would set to localhost:3000)
  origin?: null | undefined | string;
};
export class ApiConfig {
  public cookieKey?: string;
  public basePath?: string | undefined;
  public routes?: Partial<Routes>;
  public routePrefix?: string;
  public secureCookies?: boolean;
  public origin?: string | null;

  /**
   * The client side callback url. Defaults to nothing (so nile.origin will be it), but in the cases of x-origin, you want to set this explicitly to be sure nile-auth does the right thing
   * If this is set, any `callbackUrl` from the client will be ignored.
   */
  public callbackUrl?: string;

  #token?: string;

  constructor(config?: ServerConfig, logger?: string) {
    const envVarConfig: EnvConfig = { config, logger };

    this.cookieKey = getCookieKey(envVarConfig);
    this.#token = getToken(envVarConfig);
    this.callbackUrl = getCallbackUrl(envVarConfig);
    this.secureCookies = getSecureCookies(envVarConfig);
    this.basePath = getBasePath(envVarConfig);

    this.routes = config?.api?.routes;
    this.routePrefix = config?.api?.routePrefix;
    this.origin = config?.api?.origin;
  }

  public get token(): string | undefined {
    return this.#token;
  }

  public set token(value: string | undefined) {
    this.#token = value;
  }
}

export class Config {
  user: string;
  password: string;
  databaseId: string;
  databaseName: string;
  logger?: LoggerType;

  debug: boolean;

  db: NilePoolConfig;

  api: ApiConfig;

  #tenantId?: string | undefined | null;
  #userId?: string | undefined | null;

  public get tenantId(): string | undefined | null {
    return this.#tenantId;
  }

  public set tenantId(value: string | undefined | null) {
    this.#tenantId = value;
  }

  public get userId(): string | undefined | null {
    return this.#userId;
  }

  public set userId(value: string | undefined | null) {
    this.#userId = value;
  }

  constructor(config?: ServerConfig, logger?: string) {
    const envVarConfig: EnvConfig = { config, logger };
    this.user = getUsername(envVarConfig) as string;
    this.logger = config?.logger;
    this.password = getPassword(envVarConfig) as string;
    if (process.env.NODE_ENV !== 'TEST') {
      if (!this.user) {
        throw new Error(
          'User is required. Set NILEDB_USER as an environment variable or set `user` in the config options.'
        );
      }
      if (!this.password) {
        throw new Error(
          'Password is required. Set NILEDB_PASSWORD as an environment variable or set `password` in the config options.'
        );
      }
    }

    this.databaseId = getDatabaseId(envVarConfig) as string;
    this.databaseName = getDatabaseName(envVarConfig) as string;
    this.#tenantId = getTenantId(envVarConfig);
    this.debug = Boolean(config?.debug);
    this.#userId = config?.userId;

    const { host, port, ...dbConfig } = config?.db ?? {};
    const configuredHost = host ?? getDbHost(envVarConfig);
    const configuredPort = port ?? getDbPort(envVarConfig);

    this.api = new ApiConfig(config, logger);
    this.db = {
      user: this.user,
      password: this.password,
      host: configuredHost,
      port: configuredPort,
      ...dbConfig,
    };
    if (this.databaseName) {
      this.db.database = this.databaseName;
    }
  }
}
