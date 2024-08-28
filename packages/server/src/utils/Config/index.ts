import { Database, NilePoolConfig, ServerConfig } from '../../types';
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
  getLocal,
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
};

class ApiConfig {
  public cookieKey?: string;
  public basePath?: string | undefined;
  public version?: number;
  public localPath?: string;
  private _token?: string;
  constructor({
    basePath,
    cookieKey,
    token,
    version,
    localPath,
  }: {
    basePath?: string | undefined;
    cookieKey: string;
    token: string | undefined;
    version: number;
    localPath: string;
  }) {
    this.basePath = basePath;
    this.cookieKey = cookieKey;
    this.version = version;
    this._token = token;
    this.localPath = localPath ?? 'http://localhost:3000';
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
      version: config?.api?.version ?? 2,
      localPath: getLocal(envVarConfig),
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
    const { info, error } = Logger(config, '[init]');

    const envVarConfig: EnvConfig = {
      config,
    };

    const { host, port, ...dbConfig } = config.db ?? {};
    let configuredHost = host ?? getDbHost(envVarConfig);
    const configuredPort = port ?? getDbPort(envVarConfig);
    let basePath = getBasePath(envVarConfig);
    if (configuredHost && this.databaseName && this.databaseId && basePath) {
      info('Already configured, aborting fetch');
      return this;
    }

    const cp = getControlPlane(envVarConfig);

    const databaseName = getDatabaseName({ config, logger: 'getInfo' });
    const url = new URL(`${cp}/databases/configure`);
    if (databaseName) {
      url.searchParams.set('databaseName', databaseName);
    }
    info('configuring from', url.href);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getInfoBearer({ config })}`,
      },
    });
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
        configuredHost = dburl.host;
      }
    }
    this.api = new ApiConfig({
      basePath,
      cookieKey: config?.api?.cookieKey ?? 'token',
      token: getToken({ config }),
      version: config?.api?.version ?? 2,
      localPath: getLocal(envVarConfig),
    });
    this.db = {
      user: this.user,
      password: this.password,
      host: configuredHost,
      port: configuredPort,
      database: this.databaseName,
      ...dbConfig,
    };
    info('[config set]', this);
    return this;
  };
}
