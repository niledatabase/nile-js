/* eslint-disable @typescript-eslint/no-explicit-any */
import pg from 'pg';

import { NilePoolConfig } from '../types';
import { LogReturn } from '../utils/Logger';
import { ConnectionGuard, getConnectionGuard } from '../utils/connection-guard';

import {
  assertOAuthBearerConfig,
  OAuthBearerClient,
} from './OAuthBearerClient';

type AllowAny = any;

export class PoolWithLogger extends pg.Pool {
  private nileConfig: NilePoolConfig;
  private logger: LogReturn;
  private context: string[];
  private info: (...args: any[]) => void;
  private error: (...args: any[]) => void;
  private connectionGuard?: ConnectionGuard;

  constructor(config: NilePoolConfig, logger: LogReturn, context: string[]) {
    if (config.oauthBearerToken) {
      config = { ...config, Client: config.Client ?? OAuthBearerClient };
      assertOAuthBearerConfig(config);
    }
    const connectionGuard = getConnectionGuard(
      config.oauthBearerToken ?? config.password
    );
    connectionGuard?.(config);
    super(config);
    this.connectionGuard = connectionGuard;
    if (connectionGuard || config.oauthBearerToken) {
      Object.defineProperty(this, 'options', {
        writable: false,
        configurable: false,
      });
      Object.freeze(this.options.ssl);
      // pg-pool uses this.Client rather than options.Client for queued clients.
      Object.defineProperty(this, 'Client', {
        writable: false,
        configurable: false,
      });
      for (const key of [
        'password',
        'oauthBearerToken',
        'Client',
        'user',
        'database',
        'host',
        'port',
        'connectionString',
        'ssl',
      ]) {
        // pg can create a queued physical client after connect() returns. Keep
        // its authentication options fixed through that later creation.
        Object.defineProperty(this.options, key, {
          writable: false,
          configurable: false,
        });
      }
    }
    this.nileConfig = config;
    this.logger = logger;
    this.context = context;
    const { info, error } = this.logger('[pool]');
    this.info = info;
    this.error = error;
  }

  connect(): Promise<pg.PoolClient>;
  connect(
    callback: (
      err: Error | undefined,
      client: pg.PoolClient | undefined,
      release: (releaseError?: any) => void
    ) => void
  ): void;
  connect(callback?: any): any {
    // pg copies this configuration into each physical Client. Check the current
    // pool options so a later override cannot send a token over unsafe TLS.
    this.connectionGuard?.(this.options);
    return callback ? super.connect(callback) : super.connect();
  }

  query(...args: AllowAny): any {
    // give connection string a pass for these problems
    if (!this.nileConfig.connectionString) {
      if (
        !this.nileConfig.user ||
        (!this.nileConfig.password && !this.nileConfig.oauthBearerToken)
      ) {
        this.error(
          'Cannot connect to the database. User and/or password are missing. Generate them at https://console.thenile.dev'
        );
      } else if (!this.nileConfig.database) {
        this.error(
          'Unable to obtain database name. Is process.env.NILEDB_POSTGRES_URL set?'
        );
      }
    }

    let log = '[QUERY]';
    const [tenantId, userId] = this.context;
    if (tenantId) {
      log = `${log}[TENANT:${tenantId}]`;
    }
    if (userId) {
      log = `${log}[USER:${userId}]`;
    }
    this.info(log, ...args);

    // @ts-expect-error - overriding base class member
    return super.query(...args);
  }
}
