import { ServerConfig } from '../types';

import { Config } from './Config';

export default function Logger(
  config: void | Config | ServerConfig,
  ...params: unknown[]
) {
  return {
    info(...args: unknown[]) {
      if (config?.debug) {
        // eslint-disable-next-line no-console
        console.info('[niledb]', ...params, ...args);
      }
    },
    warn(...args: unknown[]) {
      if (config?.debug) {
        // eslint-disable-next-line no-console
        console.warn('[niledb]', ...params, ...args);
      }
    },
    error(...args: unknown[]) {
      if (config?.debug) {
        // eslint-disable-next-line no-console
        console.error('[niledb]', '[ERROR]', ...params, ...args);
      }
    },
  };
}
