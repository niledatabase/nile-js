/* eslint-disable no-console */
import { ServerConfig } from '../types';

import { Config } from './Config';

const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

const baseLogger = (config: void | ServerConfig, ...params: unknown[]) => ({
  info(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug) {
      console.info(
        `[niledb][DEBUG]${params.join('')} ${message}`,
        meta ? `\n${JSON.stringify(meta, null, 2)}` : ''
      );
    }
  },
  debug(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug) {
      console.debug(
        `[niledb][DEBUG]${params.join('')} ${message}`,
        meta ? `\n${JSON.stringify(meta, null, 2)}` : ''
      );
    }
  },
  warn(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug) {
      console.warn(
        `${yellow}[niledb][WARN]${reset}${params.join('')} ${message}`,
        JSON.stringify(meta, null, 2)
      );
    }
  },
  error(message: string | unknown, meta?: Record<string, unknown>) {
    console.error(
      `${red}[niledb][ERROR]${reset}${params.join('')} ${message}`,
      meta
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
