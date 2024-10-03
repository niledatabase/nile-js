import 'dotenv/config';
import { ServerConfig } from '../../types';
import Logger from '../Logger';

export type EnvConfig = {
  logger?: string;
  config?: ServerConfig;
};

export const getDatabaseId = (cfg: EnvConfig) => {
  const { config, logger } = cfg;

  const { info } = Logger(config, '[databaseId]');
  if (config?.databaseId) {
    logger && info(logger, 'config', config.databaseId);
    return String(config?.databaseId);
  }
  if (process.env.NILEDB_POSTGRES_URL) {
    const pgUrl = new URL(process.env.NILEDB_POSTGRES_URL);
    return pgUrl.pathname.substring(1);
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
  logger && info(logger, 'NILEDB_USER', process.env.NILEDB_USER);
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

  log && info(logger, 'NILEDB_PASSWORD', process.env.NILEDB_PASSWORD);
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
    logger && info(logger, 'NILEDB_TOKEN', process.env.NILEDB_TOKEN);
    return process.env.NILEDB_TOKEN;
  }
  return undefined;
};

export const getDatabaseName = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[databaseName]');
  if (config?.databaseName) {
    logger && info(logger, 'config', config.databaseName);
    return String(config.databaseName);
  }
  if (process.env.NILEDB_NAME) {
    logger && info(logger, 'NILEDB_NAME', process.env.NILEDB_NAME);
    return process.env.NILEDB_NAME;
  }
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
    logger && info(logger, 'NILEDB_TENANT', process.env.NILEDB_TENANT);
    return process.env.NILEDB_TENANT;
  }

  return null;
};

/**
 * @param cfg various overrides
 * @returns the url for REST to use
 */
export const getBasePath = (cfg: EnvConfig): undefined | string => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[basePath]');
  const basePath = config?.api?.basePath;
  if (basePath) {
    logger && info(logger, 'config', basePath);
    return basePath;
  }

  if (process.env.NILEDB_API_URL) {
    logger && info(logger, 'NILEDB_API_URL', process.env.NILEDB_API_URL);
    const apiUrl = new URL(process.env.NILEDB_API_URL);
    return apiUrl.href;
  }

  info('not set. Must run auto-configuration');
  return undefined;
};

export const getControlPlane = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[basePath]');

  if (config?.configureUrl) {
    logger && info(logger, 'config', config.configureUrl);
    return config.configureUrl;
  }

  if (process.env.NILEDB_CONFIGURE) {
    logger && info(logger, 'NILEDB_CONFIGURE', process.env.NILEDB_CONFIGURE);
    // backwards compatible, but not really
    if (!process.env.NILEDB_CONFIGURE.startsWith('http')) {
      return `https://${process.env.NILEDB_CONFIGURE}`;
    }
    return process.env.NILEDB_CONFIGURE;
  }

  logger && info(logger, 'default', 'https://global.thenile.dev');
  return 'https://global.thenile.dev';
};

export function getDbHost(cfg: EnvConfig) {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[db.host]');

  if (config?.db && config.db.host) {
    logger && info(logger, 'config', config?.db.host);
    return config.db.host;
  }

  if (process.env.NILEDB_POSTGRES_URL) {
    const pgUrl = new URL(process.env.NILEDB_POSTGRES_URL);
    logger && info(logger, 'NILEDB_POSTGRES_URL', pgUrl.host);
    return pgUrl.host;
  }

  if (process.env.NILEDB_HOST) {
    logger && info(logger, 'NILEDB_HOST', process.env.NILEDB_HOST);
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
