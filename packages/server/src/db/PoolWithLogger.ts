/* eslint-disable @typescript-eslint/no-explicit-any */
import pg from 'pg';

import { NilePoolConfig } from '../types';
import { LogReturn } from '../utils/Logger';

type AllowAny = any;

export class PoolWithLogger extends pg.Pool {
  private nileConfig: NilePoolConfig;
  private logger: LogReturn;
  private context: string[];
  private info: (...args: any[]) => void;
  private error: (...args: any[]) => void;

  constructor(config: NilePoolConfig, logger: LogReturn, context: string[]) {
    super(config);
    this.nileConfig = config;
    this.logger = logger;
    this.context = context;
    const { info, error } = this.logger('[pool]');
    this.info = info;
    this.error = error;
  }

  query(...args: AllowAny): any {
    // give connection string a pass for these problems
    if (!this.nileConfig.connectionString) {
      if (!this.nileConfig.user || !this.nileConfig.password) {
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
