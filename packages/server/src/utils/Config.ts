import { PgConnectionConfig, PoolConfig, ServerConfig } from '../types';

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
export class Config {
  database: string;
  workspace: string;

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
    this.database = String(_config?.database);
    this.workspace = String(_config?.workspace);

    // set the context
    this._tenantId = _config?.tenantId;
    this._userId = _config?.userId;

    // api config
    this.api = new ApiConfig({
      basePath: _config?.api?.basePath ?? `https://api.${niledatabase_url}`,
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

    const connection = {
      host,
      port,
      database: _config?.database,
      ...(typeof _config?.db?.connection === 'object'
        ? _config.db.connection
        : {}),
    } as PgConnectionConfig;

    this.db = {
      ..._config?.db,
      connection,
    };
  }
}
