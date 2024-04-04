import { NilePoolConfig, ServerConfig } from '../../types';
import Logger from '../Logger';

import {
  EnvConfig,
  getBasePath,
  getDatabaseName,
  getDatbaseId,
  getDbHost,
  getDbPort,
  getInfoBearer,
  getPassword,
  getTenantId,
  getToken,
  getUsername,
} from './envVars';

type Database = {
  name: string;
  apiHost: string;
  dbHost: string;
  id: string;
  message?: string; // is actually an error
  status: 'READY' | string;
};
class ApiConfig {
  public cookieKey?: string;
  public basePath?: string;
  private _token?: string;
  constructor({
    basePath,
    cookieKey,
    token,
  }: {
    basePath: string;
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

  constructor(config: ServerConfig) {
    const envVarConfig: EnvConfig = {
      config,
    };
    this.databaseId = getDatbaseId(envVarConfig) as string;
    this.user = getUsername(envVarConfig) as string;
    this.password = getPassword(envVarConfig) as string;
    this.databaseName = getDatabaseName(envVarConfig) as string;
    this._tenantId = getTenantId(envVarConfig);
    this.debug = Boolean(config?.debug);
    this._userId = config?.userId;

    const basePath = getBasePath(envVarConfig);
    const host = getDbHost(envVarConfig);
    const port = getDbPort(envVarConfig);

    this.api = new ApiConfig({
      basePath,
      cookieKey: config?.api?.cookieKey ?? 'token',
      token: getToken({ config }),
    });
    this.db = {
      user: this.user,
      password: this.password,
      host,
      port,
      database: this.databaseName,
      ...(typeof config?.db === 'object' ? config.db : {}),
    };
  }

  configure = async (config: ServerConfig): Promise<Config> => {
    const { info, error } = Logger(config, '[init]');
    const envVarConfig: EnvConfig = {
      config,
    };
    let basePath = getBasePath(envVarConfig);
    let host = getDbHost(envVarConfig);
    const port = getDbPort(envVarConfig);

    const databaseName = getDatabaseName({ config, logger: 'getInfo' });
    const url = new URL(`${basePath}/databases/configure`);
    if (databaseName) {
      url.searchParams.set('databaseName', databaseName);
    }
    info(url.href);
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
    if (!host || !this.databaseName || !this.databaseId) {
      info('[fetched database]', database);
      if (process.env.NODE_ENV !== 'TEST') {
        if ('message' in database) {
          if ('statusCode' in database) {
            error(database);
            throw new Error('HTTP error has occured');
          } else {
            throw new Error(
              'Unable to auto-configure. Please set or remove NILEDB_API, NILEDB_NAME, and NILEDB_HOST in your .env file.'
            );
          }
        }
        if (typeof database === 'object') {
          const { apiHost, dbHost, name, id } = database;
          this.databaseId = id;
          this.databaseName = name;
          // gotta do something dumb here
          const dburl = new URL(dbHost);
          const apiurl = new URL(apiHost);
          host = dburl.host;
          basePath = apiurl.origin;
        }
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
      host,
      port,
      database: this.databaseName,
      ...(typeof config?.db === 'object' ? config.db : {}),
    };
    info('[config set]', this);
    return this;
  };
}