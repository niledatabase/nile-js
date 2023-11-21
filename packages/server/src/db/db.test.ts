/* eslint-disable no-console */
import { Config } from '../utils/Config';
import { watchEvictPool } from '../utils/Event';

import NileDatabase from './NileInstance';

import DBManager from './index';
import NileDB from './index';

const properties = ['connections'];
describe.skip('db', () => {
  it('has expected properties', () => {
    const db = new NileDB({
      workspace: 'workspace',
      database: 'database',
      db: {
        connection: { port: 4433 },
      },
      api: {
        token: 'blah',
      },
      tenantId: null,
      userId: null,
    });
    expect(Object.keys(db).sort()).toEqual(properties.sort());
  });
  it('evitcs pools', (done) => {
    const config = new Config({
      database: 'database',
      workspace: 'workspace',
      db: {
        pool: {
          idleTimeoutMillis: 1,
        },
      },
    });
    new NileDatabase(config, 'someId');
    watchEvictPool((id) => {
      expect(id).toEqual('someId');
      done();
    });
  });
});

const userId = process.env.USER_ID;

describe('dbsync', () => {
  it('does not work', (done) => {
    const config = new Config({
      workspace: String(process.env.WORKSPACE),
      database: String(process.env.DATABASE),
      db: {
        connection: {
          user: process.env.USER,
          password: process.env.PASSWORD,
          host: 'localhost',
        },
      },
    });
    const db = new DBManager(config);
    // @ts-expect-error - test
    const nile = db.getConnection(config).knex;
    const manyQueries = [
      nile('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
      nile('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
      nile('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
      nile('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
    ];
    Promise.all(manyQueries).then((data) => {
      console.log(data, 'first batch');
    });

    setTimeout(async () => {
      const data = await Promise.all(manyQueries);
      console.log(data, 'third batch');
      done();
    }, 100);
    // @ts-expect-error - test
    const nile2 = db.getConnection(config).knex;
    const moreQueries = [
      nile2('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
      nile2('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
      nile2('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
      nile2('tenants')
        .select('tenants.id', 'tenants.name')
        .join('users.tenant_users', 'tenants.id', '=', 'tenant_users.tenant_id')
        .where('tenant_users.user_id', '=', userId),
    ];

    Promise.all(moreQueries).then((data) => {
      console.log(data, 'second batch');
    });
  }, 50000);
});
