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
} from './envVars';

export type ConfigRoutes = {
  SIGNIN?: string;
  SESSION?: string;
  PROVIDERS?: string;
  CSRF?: string;
  CALLBACK?: string;
  SIGNOUT?: string;
  ME?: string;
  ERROR?: string;
  TENANTS?: string;
  TENANT_USERS?: string;
  USERS?: string;
};

class ApiConfig {
  public cookieKey?: string;
  public basePath?: string | undefined;
  private _token?: string;
  constructor({
    basePath,
    cookieKey,
    token,
  }: {
    basePath?: string | undefined;
    cookieKey: string;
    token: string | undefined;
  }) {
    this.basePath = basePath;
    this.cookieKey = cookieKey;
    this._token = token;
  }

  public get token(): string | undefined {
    return this._token;
  }

  public set token(value: string | undefined) {
    this._token = value;
  }
}

export class Config {
  user: string;
  password: string;
  databaseId: string;
  databaseName: string;
  routePrefix?: string;
  routes?: ConfigRoutes;
  logger?: LoggerType;
  secureCookies?: boolean | undefined;

  debug: boolean;

  db: NilePoolConfig;

  api: ApiConfig;

  private _tenantId?: string | undefined | null;
  private _userId?: string | undefined | null;

  public get tenantId(): string | undefined | null {
    return this._tenantId;
  }

  public set tenantId(value: string | undefined | null) {
    this._tenantId = value;
  }

  public get userId(): string | undefined | null {
    return this._userId;
  }

  public set userId(value: string | undefined | null) {
    this._userId = value;
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

    this.secureCookies = getSecureCookies(envVarConfig);
    this.databaseId = getDatabaseId(envVarConfig) as string;
    this.databaseName = getDatabaseName(envVarConfig) as string;
    this._tenantId = getTenantId(envVarConfig);
    this.debug = Boolean(config?.debug);
    this._userId = config?.userId;

    const basePath = getBasePath(envVarConfig);
    const { host, port, ...dbConfig } = config?.db ?? {};
    const configuredHost = host ?? getDbHost(envVarConfig);
    const configuredPort = port ?? getDbPort(envVarConfig);

    this.api = new ApiConfig({
      basePath,
      cookieKey: config?.api?.cookieKey ?? 'token',
      token: getToken({ config }),
    });
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
      this.api = new ApiConfig({
        basePath,
        cookieKey: config?.api?.cookieKey ?? 'token',
        token: getToken({ config }),
      });
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
    this.api = new ApiConfig({
      basePath,
      cookieKey: config?.api?.cookieKey ?? 'token',
      token: getToken({ config }),
    });
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
