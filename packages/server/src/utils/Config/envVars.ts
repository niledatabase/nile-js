import 'dotenv/config';
import { ServerConfig } from '../../types';
import Logger from '../Logger';

export type EnvConfig = {
  logger?: string;
  config?: ServerConfig;
};

export const getDatbaseId = (cfg: EnvConfig) => {
  const { config, logger } = cfg;

  const { info } = Logger(config, '[databaseId]');
  if (config?.databaseId) {
    logger && info(logger, 'config', config.databaseId);
    return String(config?.databaseId);
  }
  logger && info(logger, 'env', process.env.NILEDB_ID);
  return process.env.NILEDB_ID;
};
export const getUsername = (cfg: EnvConfig) => {
  const { config, logger } = cfg;

  const { info } = Logger(config, '[username]');
  if (config?.user) {
    logger && info(logger, 'config', config.user);
    return String(config?.user);
  }
  logger && info(logger, '.env', process.env.NILEDB_USER);
  return process.env.NILEDB_USER;
};

export const getPassword = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const log = logProtector(logger);
  const { info } = Logger(config, '[password]');
  if (config?.password) {
    log && info(logger, 'config', config.password);

    return String(config.password);
  }

  log && info(logger, '.env', process.env.NILEDB_PASSWORD);
  return process.env.NILEDB_PASSWORD;
};

export const getInfoBearer = (cfg: EnvConfig) => {
  return `${getUsername(cfg)}:${getPassword(cfg)}`;
};

export const getToken = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[token]');
  if (config?.api?.token) {
    logger && info(logger, 'config', config.api?.token);
    return String(config.api?.token);
  }
  if (process.env.NILEDB_TOKEN) {
    logger && info(logger, '.env', process.env.NILEDB_TOKEN);
    return process.env.NILEDB_TOKEN;
  }
  return undefined;
};

export const getDatabaseName = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { warn, info } = Logger(config, '[databaseName]');
  if (config?.databaseName) {
    logger && info(logger, 'config', config.databaseName);
    return String(config.databaseName);
  }
  if (process.env.NILEDB_NAME) {
    logger && info(logger, 'config', process.env.NILEDB_NAME);
    return process.env.NILEDB_NAME;
  }
  warn(
    logger,
    'config',
    'No database has been set. Set NILEDB_NAME in .env or call `nile.init()`'
  );
  return null;
};

export const getTenantId = (cfg: EnvConfig): string | null => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[tenantId]');
  if (config?.tenantId) {
    logger && info(logger, 'config', config.tenantId);
    return config.tenantId;
  }

  if (process.env.NILEDB_TENANT) {
    logger && info(logger, '.env', process.env.NILEDB_TENANT);
    return process.env.NILEDB_TENANT;
  }

  return null;
};

export const getBasePath = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[basePath]');
  const basePath = config?.api?.basePath;
  if (basePath) {
    logger && info(logger, 'config', config?.api?.basePath);
    return basePath;
  }

  if (process.env.NILEDB_API) {
    logger && info(logger, '.env', process.env.NILEDB_API);
    return `https://${process.env.NILEDB_API}`;
  }

  logger && info(logger, 'default', process.env.NILEDB_API);
  return 'https://api.thenile.dev';
};

export function getDbHost(cfg: EnvConfig) {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[db.host]');

  if (config?.db && config.db.host) {
    logger && info(logger, 'config', config?.db.host);
    return config.db.host;
  }

  if (process.env.NILEDB_HOST) {
    logger && info(logger, '.env', process.env.NILEDB_HOST);
    return process.env.NILEDB_HOST;
  }

  logger && info(logger, 'default', 'db.thenile.dev');
  return 'db.thenile.dev';
}

export function getDbPort(cfg: EnvConfig): number {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[db.port]');
  if (config?.db?.port && config.db.port != null) {
    logger && info(logger, 'config', config?.db.port);
    return Number(config.db?.port);
  }

  if (process.env.NILEDB_PORT) {
    logger && info(logger, 'config', process.env.NILEDB_PORT);
    return Number(process.env.NILEDB_PORT);
  }
  logger && info(logger, 'default', 5432);
  return 5432;
}

// don't let people accidentally log secrets to production
const logProtector = (logger?: string) => {
  return process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
    ? logger
    : null;
};
