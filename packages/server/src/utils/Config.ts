import { ServerConfig } from '../types';

export class Config {
  basePath?: string;
  database: string;
  tenantId?: string;
  workspace: string;
  cookieKey: string;
  constructor(config: ServerConfig) {
    this.basePath = config.basePath ?? 'https://prod.thenile.dev';
    this.database = config.database;
    this.tenantId = config.tenantId;
    this.workspace = config.workspace;
    this.cookieKey = config.cookieKey ?? 'token';
  }
}
