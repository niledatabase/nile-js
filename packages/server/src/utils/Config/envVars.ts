import 'dotenv/config';
import { LoggerType, NileConfig } from '../../types';
import Logger from '../Logger';

export type EnvConfig = {
  config: NileConfig & { logger: LoggerType };
};

export const getApiUrl = (cfg: EnvConfig) => {
  const { config } = cfg;
  if (config?.apiUrl != null) {
    return config?.apiUrl;
  }
  if (stringCheck(process.env.NILEDB_API_URL)) {
    return process.env.NILEDB_API_URL;
  }

  throw new Error(
    'A connection to nile-auth is required. Set NILEDB_API_URL as an environment variable.'
  );
};

export const getCallbackUrl = (cfg: EnvConfig) => {
  const { config } = cfg;
  if (stringCheck(config?.callbackUrl)) {
    return config?.callbackUrl;
  }
  return process.env.NILEDB_CALLBACK_URL;
};

export const getSecureCookies = (cfg: EnvConfig) => {
  const { config } = cfg;
  if (config?.secureCookies != null) {
    return config?.secureCookies;
  }
  if (stringCheck(process.env.NILEDB_SECURECOOKIES)) {
    return Boolean(process.env.NILEDB_SECURECOOKIES);
  }
  return undefined;
};

export const getUsername = (cfg: EnvConfig) => {
  const { config } = cfg;
  const logger = config.logger;

  const { info } = Logger(config, '[username]');
  if (config?.user) {
    logger && info(`${logger}[config] ${config.user}`);
    return String(config?.user);
  }
  const user = stringCheck(process.env.NILEDB_USER);
  if (user) {
    logger && info(`${logger}[NILEDB_USER] ${user}`);
    return user;
  }

  const pg = stringCheck(process.env.NILEDB_POSTGRES_URL);
  if (pg) {
    try {
      const url = new URL(pg);
      if (url.username) {
        return url.username;
      }
    } catch (e) {
      //ok to fail
    }
  }
  throw new Error(
    'A database user is required. Set NILEDB_USER as an environment variable.'
  );
};

export const getPassword = (cfg: EnvConfig) => {
  const { config } = cfg;
  const logger = config.logger;
  const log = logProtector(logger);
  const { info } = Logger(config, '[password]');
  if (stringCheck(config?.password)) {
    log && info(`${logger}[config] ***`);
    return String(config?.password);
  }

  const pass = stringCheck(process.env.NILEDB_PASSWORD);
  if (pass) {
    logger && info(`${logger}[NILEDB_PASSWORD] ***`);

    return pass;
  }
  const pg = stringCheck(process.env.NILEDB_POSTGRES_URL);
  if (pg) {
    try {
      const url = new URL(pg);
      if (url.password) {
        return url.password;
      }
    } catch (e) {
      // ok to fail
    }
  }
  throw new Error(
    'A database password is required. Set NILEDB_PASSWORD as an environment variable.'
  );
};

export const getDatabaseName = (cfg: EnvConfig) => {
  const { config } = cfg;
  const logger = config.logger;
  const { info } = Logger(config, '[databaseName]');
  if (stringCheck(config?.databaseName)) {
    logger && info(`${logger}[config] ${config?.databaseName}`);
    return String(config?.databaseName);
  }
  const name = stringCheck(process.env.NILEDB_NAME);
  if (name) {
    logger && info(`${logger}[NILEDB_NAME] ${name}`);
    return name;
  }

  if (process.env.NILEDB_POSTGRES_URL) {
    try {
      const pgUrl = new URL(process.env.NILEDB_POSTGRES_URL);
      return pgUrl.pathname.substring(1);
    } catch (e) {
      // ok to fail
    }
  }
  throw new Error(
    'A database name is required. Set NILEDB_PASSWORD as an environment variable.'
  );
};

export const getTenantId = (cfg: EnvConfig): string | null => {
  const { config } = cfg;
  const logger = config.logger;
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

export function getDbHost(cfg: EnvConfig) {
  const { config } = cfg;
  const logger = config.logger;
  const { info } = Logger(config, '[db.host]');

  if (stringCheck(config?.db && config.db.host)) {
    logger && info(`${logger}[config] ${config?.db?.host}`);
    return String(config?.db?.host);
  }

  if (stringCheck(process.env.NILEDB_HOST)) {
    logger && info(`${logger}[NILEDB_HOST] ${process.env.NILEDB_HOST}`);
    return process.env.NILEDB_HOST;
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

  logger && info(`${logger}[default] db.thenile.dev`);
  return 'db.thenile.dev';
}

export function getDbPort(cfg: EnvConfig): number {
  const { config } = cfg;
  const logger = config.logger;
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
const logProtector = (logger: LoggerType) => {
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
