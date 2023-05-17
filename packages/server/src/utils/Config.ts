import { KnexConfig, PgConnectionConfig, ServerConfig } from '../types';

export class Config {
  database: string;
  workspace: string;

  db: KnexConfig;

  api?: {
    cookieKey?: string;
    basePath?: string;
    token?: string;
  };

  private _tenantId?: string | undefined;

  public get tenantId(): string | undefined {
    return this._tenantId;
  }

  public set tenantId(value: string | undefined) {
    this._tenantId = value;
  }

  constructor(_config: ServerConfig) {
    this.database = _config.database;
    this.tenantId = _config.tenantId;
    this.workspace = _config.workspace;
    this.api = {
      basePath: _config.api?.basePath ?? 'https://prod.thenile.dev',
      cookieKey: _config.api?.cookieKey ?? 'token',
      token: _config.api?.token,
    };

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
