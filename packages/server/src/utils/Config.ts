import { KnexConfig, PgConnectionConfig, ServerConfig } from '../types';

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
  database: string;
  workspace: string;

  db: KnexConfig;

  api: ApiConfig;

  private _tenantId?: string | undefined;

  public get tenantId(): string | undefined {
    return this._tenantId;
  }

  public set tenantId(value: string | undefined) {
    this._tenantId = value;
  }

  constructor(_config: ServerConfig) {
    this.database = _config.database;
    this._tenantId = _config.tenantId;
    this.workspace = _config.workspace;
    this.api = new ApiConfig({
      basePath: _config.api?.basePath ?? 'https://dev.khnum.thenile.dev',
      cookieKey: _config.api?.cookieKey ?? 'token',
      token: _config.api?.token,
    });

    const host: string =
      _config.db &&
      _config.db.connection &&
      typeof _config.db?.connection !== 'string' &&
      'host' in _config.db.connection
        ? String(_config.db.connection.host)
        : 'dev.khnum.thenile.dev';

    const port: number =
      _config.db?.connection &&
      typeof _config.db?.connection !== 'string' &&
      'port' in _config.db.connection
        ? Number(_config.db?.connection?.port)
        : 5432;

    const connection = {
      host,
      port,
      database: _config.database,
      ...(typeof _config.db?.connection === 'object'
        ? _config.db.connection
        : {}),
    } as PgConnectionConfig;

    this.db = {
      ..._config.db,
      connection,
    };
  }
}
