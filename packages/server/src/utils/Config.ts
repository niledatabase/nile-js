import { PgConnectionConfig, PoolConfig, ServerConfig } from '../types';

import blockingFetch from './blockingFetch';

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

const niledatabase_url = 'thenile.dev';
type DBConfig = {
  connection: PgConnectionConfig;
  pool?: PoolConfig;
};

function getBasePath(config?: ServerConfig) {
  const database = blockingFetch(
    `https://api.${niledatabase_url}/databases/${String(config?.databaseId)}`
  );
  const apiUrl = 'apiUrl' in database ? database.apiUrl : '';
  const basePath = config?.api?.basePath ?? apiUrl;
  if (basePath) {
    return basePath;
  }
  return `https://api.${niledatabase_url}`;
}

export class Config {
  username: string;
  password: string;
  databaseId: string;

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

  constructor(_config?: ServerConfig) {
    // always provided
    this.databaseId = String(_config?.databaseId);
    this.username = String(_config?.username);
    this.password = String(_config?.password);
    // set the context
    this._tenantId = _config?.tenantId;
    this._userId = _config?.userId;
    // this endpoint does not exist
    const basePath = getBasePath(_config);
    // api config
    this.api = new ApiConfig({
      basePath: String(basePath),
      cookieKey: _config?.api?.cookieKey ?? 'token',
      token: _config?.api?.token,
    });

    // db config
    const host: string =
      _config?.db &&
      _config.db.connection &&
      typeof _config.db?.connection !== 'string' &&
      'host' in _config.db.connection
        ? String(_config.db.connection.host)
        : `db.${niledatabase_url}`;

    const port: number =
      _config?.db?.connection &&
      typeof _config.db?.connection !== 'string' &&
      'port' in _config.db.connection
        ? Number(_config.db?.connection?.port)
        : 5432;

    const baseCreds = {
      user: this.username,
      password: this.password,
    };

    const connection = {
      host,
      port,
      database: _config?.databaseId,
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
