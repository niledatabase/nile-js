/* eslint-disable no-console */
import { Routes } from '../api/types';
import { urlMatches } from '../api/utils/routes';
import { NileConfig } from '../types';

const red = '\x1b[31m';
const yellow = '\x1b[38;2;255;255;0m';
const purple = '\x1b[38;2;200;160;255m';
const orange = '\x1b[38;2;255;165;0m';
const reset = '\x1b[0m';

const baseLogger = (config: void | NileConfig, ...params: unknown[]) => ({
  silly(message: string | unknown, meta?: Record<string, unknown>) {
    if (config?.debug && process.env.LOG_LEVEL === 'silly') {
      console.log(
        `${orange}[niledb]${reset}${purple}[DEBUG]${reset}${params.join(
          ''
        )}${reset} ${message}`,
        meta ? `${JSON.stringify(meta)}` : ''
      );
    }
  },
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
      console.log(
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

export type LogFunction = (
  message: string | unknown,
  meta?: Record<string, unknown>
) => void;

export type Loggable = {
  info: LogFunction;
  debug: LogFunction;
  warn: LogFunction;
  error: LogFunction;
  silly: LogFunction;
};
export type LogReturn = (prefixes?: string | string[]) => Loggable;

export default function Logger(config?: NileConfig): LogReturn {
  return (prefixes) => {
    const { info, debug, warn, error, silly } =
      config && typeof config?.logger === 'function'
        ? config.logger(prefixes)
        : baseLogger(config, prefixes);

    return {
      info,
      debug,
      warn,
      error,
      silly,
    };
  };
}

export function matchesLog(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.LOG);
}
