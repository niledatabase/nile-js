import syncFetch from 'sync-fetch';

import { PgConnectionConfig, PoolConfig, ServerConfig } from '../../types';
import Logger from '../Logger';

import {
  getBasePath,
  getDatabaseName,
  getDatbaseId,
  getDbHost,
  getDbPort,
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

type DBConfig = {
  connection: PgConnectionConfig;
  pool?: PoolConfig;
};

export class Config {
  username: string;
  password: string;
  databaseId: string;
  databaseName: string;

  debug: boolean;

  db: DBConfig;

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

  constructor(_config: ServerConfig, allowPhoneHome?: boolean) {
    const { info } = Logger(_config, '[config]');
    // always provided
    this.databaseId = getDatbaseId(_config) as string;
    this.username = getUsername(_config) as string;
    this.password = getPassword(_config) as string;
    this.databaseName = getDatabaseName(_config) as string;
    this._tenantId = getTenantId(_config);
    this.debug = Boolean(_config?.debug);

    let basePath = getBasePath(_config);

    let host = getDbHost(_config);
    const port = getDbPort(_config);

    this._userId = _config?.userId;

    if (allowPhoneHome && (!host || !this.databaseName || !this.databaseId)) {
      const database = phoneHome(_config);
      info('[fetched database]', database);
      if (process.env.NODE_ENV !== 'TEST') {
        if ('message' in database) {
          throw new Error(
            'Unable to obtain database config. Please set NILEDB_API, NILEDB_NAME, and NILEDB_HOST to the correct region in your .env file.'
          );
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
      cookieKey: _config?.api?.cookieKey ?? 'token',
      token: _config?.api?.token,
    });

    const baseCreds = {
      user: this.username,
      password: this.password,
    };

    const connection = {
      host,
      port,
      database: this.databaseName,
      ...(typeof _config?.db?.connection === 'object'
        ? _config.db.connection
        : baseCreds),
    } as PgConnectionConfig;

    this.db = {
      ..._config?.db,
      connection,
    };
  }
}

function phoneHome(config: ServerConfig): Database {
  const basePath = getBasePath(config);
  const databaseId = getDatbaseId(config);
  const url = `${basePath}/workspaces/nile_check/databases`;
  const { info, error } = Logger(config, '[phone home]');
  info(url);
  const res = syncFetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const possibleError = res.clone();
  try {
    const json = res.json();
    const db = json.find((db: Database) => db.id === databaseId);
    return db;
  } catch (e) {
    const message = possibleError.text();
    error(message);
    return { message } as Database;
  }
}
