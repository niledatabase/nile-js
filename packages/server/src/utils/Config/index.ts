import { Routes } from '../../api/types';
import {
  Database,
  LoggerType,
  NilePoolConfig,
  ServerConfig,
} from '../../types';
import Logger from '../Logger';

import {
  EnvConfig,
  getBasePath,
  getControlPlane,
  getDatabaseName,
  getDatabaseId,
  getDbHost,
  getDbPort,
  getInfoBearer,
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
  headers?: null | Headers | Record<string, string>;
};
export class ApiConfig {
  public cookieKey?: string;
  public basePath?: string | undefined;
  public routes?: Partial<Routes>;
  public routePrefix?: string;
  public secureCookies?: boolean;
  public origin?: string | null;
  public headers?: Headers | null;

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

    if (config?.api?.headers instanceof Headers) {
      this.headers = config?.api?.headers;
    } else if (config?.api?.headers) {
      this.headers = new Headers(config.api.headers);
    }

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

  configure = async (config: ServerConfig): Promise<Config> => {
    const { info, error, debug } = Logger(config, '[init]');

    const envVarConfig: EnvConfig = {
      config,
    };

    const { host, port, ...dbConfig } = config.db ?? {};
    let configuredHost = host ?? getDbHost(envVarConfig);
    const configuredPort = port ?? getDbPort(envVarConfig);
    let basePath = getBasePath(envVarConfig);
    if (configuredHost && this.databaseName && this.databaseId && basePath) {
      info('Already configured, aborting fetch');
      this.api = new ApiConfig(config);
      this.db = {
        user: this.user,
        password: this.password,
        host: configuredHost,
        port: configuredPort,
        database: this.databaseName,
        ...dbConfig,
      };
      const cloned = { ...this.db };
      cloned.password = '***';
      info('[config set]', { db: cloned, api: this.api });
      return this;
    } else {
      const msg = [];
      if (!configuredHost) {
        msg.push('Database host');
      }
      if (!this.databaseName) {
        msg.push('Database name');
      }
      if (!this.databaseId) {
        msg.push('Database id');
      }
      if (!basePath) {
        msg.push('API URL');
      }
      info(
        `[autoconfigure] ${msg.join(', ')} ${
          msg.length > 1 ? 'are' : 'is'
        } missing from the config. Autoconfiguration will run.`
      );
    }

    const cp = getControlPlane(envVarConfig);

    const databaseName = getDatabaseName({ config, logger: 'getInfo' });
    const url = new URL(`${cp}/databases/configure`);
    if (databaseName) {
      url.searchParams.set('databaseName', databaseName);
    }
    info(`configuring from ${url.href}`);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getInfoBearer({ config })}`,
      },
    }).catch(() => {
      error(`Unable to auto-configure. is ${url} available?`);
    });
    if (!res) {
      return this;
    }
    let database: Database;
    const possibleError = res.clone();
    try {
      const json: Database = await res.json();
      if (res.status === 404) {
        info('is the configured databaseName correct?');
      }
      if (json.status && json.status !== 'READY') {
        database = { message: 'Database is not ready yet' } as Database;
      } else {
        database = json;
      }
    } catch (e) {
      const message = await possibleError.text();
      debug('Unable to auto-configure');
      error(message);
      database = { message } as Database;
    }
    info('[fetched database]', database);
    if (process.env.NODE_ENV !== 'TEST') {
      if ('message' in database) {
        if ('statusCode' in database) {
          error(database);
          throw new Error('HTTP error has occurred');
        } else {
          throw new Error(
            'Unable to auto-configure. Please remove NILEDB_NAME, NILEDB_API_URL, NILEDB_POSTGRES_URL, and/or NILEDB_HOST from your environment variables.'
          );
        }
      }
      if (typeof database === 'object') {
        const { apiHost, dbHost, name, id } = database;
        basePath = basePath || apiHost;
        this.databaseId = id;
        this.databaseName = name;
        const dburl = new URL(dbHost);
        configuredHost = dburl.hostname;
      }
    }
    this.api = new ApiConfig(config);
    this.db = {
      user: this.user,
      password: this.password,
      host: configuredHost,
      port: configuredPort,
      database: this.databaseName,
      ...dbConfig,
    };
    info('[config set]', { db: this.db, api: this.api });
    return this;
  };
}
