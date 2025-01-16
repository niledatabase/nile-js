import 'dotenv/config';
import { ServerConfig } from '../../types';
import Logger from '../Logger';

export type EnvConfig = {
  logger?: string;
  config?: ServerConfig;
};

export const getSecureCookies = (cfg: EnvConfig) => {
  const { config } = cfg;
  if (stringCheck(process.env.NILEDB_SECURECOOKIES)) {
    return Boolean(process.env.NILEDB_SECURECOOKIES);
  }
  return config?.secureCookies;
};

export const getDatabaseId = (cfg: EnvConfig) => {
  const { config, logger } = cfg;

  const { info } = Logger(config, '[databaseId]');
  if (stringCheck(config?.databaseId)) {
    logger && info(`${logger}[config] ${config?.databaseId}`);
    return String(config?.databaseId);
  }
  const dbId = stringCheck(process.env.NILEDB_API_URL);
  if (dbId) {
    try {
      const pgUrl = new URL(dbId);
      return pgUrl.pathname.split('/')[3];
    } catch (e) {
      // ok to fail
    }
  }
  logger && info(`${logger}[NILEDB_ID] ${String(process.env.NILEDB_ID)}`);
  return process.env.NILEDB_ID;
};
export const getUsername = (cfg: EnvConfig) => {
  const { config, logger } = cfg;

  const { info } = Logger(config, '[username]');
  if (config?.user) {
    logger && info(`${logger}[config] ${config.user}`);
    return String(config?.user);
  }
  const pg = stringCheck(process.env.NILEDB_POSTGRES_URL);
  if (pg) {
    const url = new URL(pg);
    if (url.username) {
      return url.username;
    }
  }
  logger && info(`${logger}[NILEDB_USER] ${String(process.env.NILEDB_USER)}`);
  return process.env.NILEDB_USER;
};

export const getPassword = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const log = logProtector(logger);
  const { info } = Logger(config, '[password]');
  if (stringCheck(config?.password)) {
    log && info(`${logger}[config] ${config?.password}`);
    return String(config?.password);
  }
  const pg = stringCheck(process.env.NILEDB_POSTGRES_URL);
  if (pg) {
    const url = new URL(pg);
    if (url.password) {
      return url.password;
    }
  }

  logger &&
    info(`${logger}[NILEDB_PASSWORD] ${String(process.env.NILEDB_PASSWORD)}`);
  return process.env.NILEDB_PASSWORD;
};

export const getInfoBearer = (cfg: EnvConfig) => {
  return `${getUsername(cfg)}:${getPassword(cfg)}`;
};

export const getToken = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[token]');
  if (stringCheck(config?.api?.token)) {
    logger && info(`${logger}[config] ${config?.api?.token}`);
    return String(config?.api?.token);
  }
  const token = stringCheck(process.env.NILEDB_TOKEN);
  if (token) {
    logger && info(`${logger}[NILEDB_TOKEN] ${process.env.NILEDB_TOKEN}`);
    return process.env.NILEDB_TOKEN;
  }
  return undefined;
};

export const getDatabaseName = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[databaseName]');
  if (stringCheck(config?.databaseName)) {
    logger && info(`${logger}[config] ${config?.databaseName}`);
    return String(config?.databaseName);
  }
  const name = stringCheck(process.env.NILEDB_NAME);
  if (name) {
    logger && info(`${logger}[NILEDB_NAME] ${process.env.NILEDB_NAME}`);
    return process.env.NILEDB_NAME;
  }

  if (process.env.NILEDB_POSTGRES_URL) {
    try {
      const pgUrl = new URL(process.env.NILEDB_POSTGRES_URL);
      return pgUrl.pathname.substring(1);
    } catch (e) {
      // ok to fail
    }
  }
  return null;
};

export const getTenantId = (cfg: EnvConfig): string | null => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[tenantId]');
  if (stringCheck(config?.tenantId)) {
    logger && info(`${logger}[config] ${config?.tenantId}`);
    return String(config?.tenantId);
  }

  if (stringCheck(process.env.NILEDB_TENANT)) {
    logger && info(`${logger}[NILEDB_TENANT] ${process.env.NILEDB_TENANT}`);
    return String(process.env.NILEDB_TENANT);
  }

  return null;
};

/**
 * @param cfg various overrides
 * @returns the url for REST to use
 */
export const getBasePath = (cfg: EnvConfig): undefined | string => {
  const { config, logger } = cfg;
  const { warn, info, error } = Logger(config, '[basePath]');
  const basePath = config?.api?.basePath;
  if (stringCheck(basePath)) {
    logger && info(`${logger}[config] ${basePath}`);
    return basePath;
  }

  const envUrl = stringCheck(process.env.NILEDB_API_URL);
  if (envUrl) {
    logger && info(`${logger}[NILEDB_API_URL] ${process.env.NILEDB_API_URL}`);
    try {
      const apiUrl = new URL(envUrl);
      return apiUrl.href;
    } catch (e) {
      if (e instanceof Error) {
        error(e.stack);
      }
    }
  }

  warn('not set. Must run auto-configuration');
  return undefined;
};

export const getControlPlane = (cfg: EnvConfig) => {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[basePath]');

  if (stringCheck(config?.configureUrl)) {
    logger && info(`${logger}[config] ${config?.configureUrl}`);
    return String(config?.configureUrl);
  }

  const autoConfigUrl = stringCheck(process.env.NILEDB_CONFIGURE);
  if (autoConfigUrl) {
    logger &&
      info(`${logger}[NILEDB_CONFIGURE] ${process.env.NILEDB_CONFIGURE}`);
    // backwards compatible, but not really
    if (!autoConfigUrl.startsWith('http')) {
      return `https://${process.env.NILEDB_CONFIGURE}`;
    }
    return process.env.NILEDB_CONFIGURE;
  }

  logger && info(`${logger}[default] https://global.thenile.dev`);
  return 'https://global.thenile.dev';
};

export function getDbHost(cfg: EnvConfig) {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[db.host]');

  if (stringCheck(config?.db && config.db.host)) {
    logger && info(`${logger}[config] ${config?.db?.host}`);
    return String(config?.db?.host);
  }

  const pg = stringCheck(process.env.NILEDB_POSTGRES_URL);
  if (pg) {
    try {
      const pgUrl = new URL(pg);
      logger && info(`${logger}[NILEDB_POSTGRES_URL] ${pgUrl.hostname}`);
      return pgUrl.hostname;
    } catch (e) {
      // ok to fail
    }
  }

  if (stringCheck(process.env.NILEDB_HOST)) {
    logger && info(`${logger}[NILEDB_HOST] ${process.env.NILEDB_HOST}`);
    return process.env.NILEDB_HOST;
  }

  logger && info(`${logger}[default] db.thenile.dev`);
  return 'db.thenile.dev';
}

export function getDbPort(cfg: EnvConfig): number {
  const { config, logger } = cfg;
  const { info } = Logger(config, '[db.port]');
  if (config?.db?.port && config.db.port != null) {
    logger && info(`${logger}[config] ${config?.db.port}`);
    return Number(config.db?.port);
  }

  if (stringCheck(process.env.NILEDB_PORT)) {
    logger && info(`${logger}[NILEDB_PORT] ${process.env.NILEDB_PORT}`);
    return Number(process.env.NILEDB_PORT);
  }

  const pg = stringCheck(process.env.NILEDB_POSTGRES_URL);
  if (pg) {
    try {
      const pgUrl = new URL(pg);
      if (pgUrl.port) {
        return Number(pgUrl.port);
      }
    } catch (e) {
      // ok to fail
    }
  }
  logger && info(`${logger}[default] 5432`);
  return 5432;
}

// don't let people accidentally log secrets to production
const logProtector = (logger?: string) => {
  return process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
    ? logger
    : null;
};

const stringCheck = (str: string | null | undefined) => {
  if (str && str !== '') {
    return str;
  }
  return;
};
