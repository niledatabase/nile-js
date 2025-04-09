/* eslint-disable no-console */
import { Routes } from '../api/types';
import urlMatches from '../api/utils/routes/urlMatches';
import { ServerConfig } from '../types';

import { Config } from './Config';

const red = '\x1b[31m';
const yellow = '\x1b[38;2;255;255;0m';
const purple = '\x1b[38;2;200;160;255m';
const orange = '\x1b[38;2;255;165;0m';
const reset = '\x1b[0m';

const baseLogger = (config: void | ServerConfig, ...params: unknown[]) => ({
  info(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug) {
      console.info(
        `${orange}[niledb]${reset}${purple}[DEBUG]${reset}${params.join(
          ''
        )}${reset} ${message}`,
        meta ? `${JSON.stringify(meta)}` : ''
      );
    }
  },
  debug(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug) {
      console.debug(
        `${orange}[niledb]${reset}${purple}[DEBUG]${reset}${params.join(
          ''
        )}${reset} ${message}`,
        meta ? `${JSON.stringify(meta)}` : ''
      );
    }
  },
  warn(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug) {
      console.warn(
        `${orange}[niledb]${reset}${yellow}[WARN]${reset}${params.join(
          ''
        )}${reset} ${message}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },
  error(message: string | unknown, meta?: Record<string, unknown>) {
    console.error(
      `${orange}[niledb]${reset}${red}[ERROR]${reset}${params.join(
        ''
      )}${red} ${message}`,
      meta ? meta : '',
      `${reset}`
    );
  },
});

export default function Logger(
  config?: Config | ServerConfig,
  ...params: unknown[]
) {
  const base = baseLogger(config, params);
  const info = config?.logger?.info ?? base.info;
  const debug = config?.logger?.debug ?? base.debug;
  const warn = config?.logger?.warn ?? base.warn;
  const error = config?.logger?.error ?? base.error;
  return { info, warn, error, debug };
}

export function matchesLog(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.LOG);
}
