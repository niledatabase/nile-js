import 'dotenv/config';
import { ServerConfig } from '@niledatabase/server/types';

export const getDatbaseId = (_config?: ServerConfig) =>
  _config?.databaseId ? String(_config?.databaseId) : process.env.NILEDB_ID;

export const getUsername = (_config?: ServerConfig) =>
  _config?.username ? String(_config?.username) : process.env.NILEDB_USER;

export const getPassword = (_config?: ServerConfig) =>
  _config?.password ? String(_config.password) : process.env.NILEDB_PASSWORD;

export const getToken = (_config?: ServerConfig) =>
  _config?.api?.token ? String(_config.api?.token) : process.env.NILEDB_TOKEN;

export const getDatabaseName = (_config?: ServerConfig) =>
  _config?.databaseName
    ? String(_config.databaseName)
    : process.env.NILEDB_NAME;

export const getTenantId = (_config?: ServerConfig): string | null => {
  if (_config?.tenantId) {
    return _config.tenantId;
  }
  if (process.env.NILEDB_TENANT) {
    return process.env.NILEDB_TENANT;
  }
  return null;
};

export const getBasePath = (config?: ServerConfig) => {
  const basePath = config?.api?.basePath;
  if (basePath) {
    return basePath;
  }

  if (process.env.NILEDB_API) {
    return `https://${process.env.NILEDB_API}`;
  }

  return 'https://api.thenile.dev';
};

export function getDbHost(_config?: ServerConfig) {
  if (
    _config?.db &&
    _config.db.connection &&
    typeof _config.db?.connection !== 'string' &&
    'host' in _config.db.connection
  ) {
    return _config.db.connection.host;
  } else if (process.env.NILEDB_HOST) {
    return process.env.NILEDB_HOST;
  }
  return 'db.thenile.dev';
}

export function getDbPort(_config?: ServerConfig): number {
  if (
    _config?.db?.connection &&
    typeof _config.db?.connection !== 'string' &&
    'port' in _config.db.connection
  ) {
    return Number(_config.db?.connection?.port);
  }
  if (process.env.NILEDB_PORT) {
    return Number(process.env.NILEDB_PORT);
  }
  return 5432;
}
