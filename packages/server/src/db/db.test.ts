/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';

import NileDB, { handleWithUser, handleWithTenant } from './index';

describe('db', () => {
  it('is actually knex', () => {
    const db = NileDB({ client: 'pg' });
    expect(String(db)).toContain('knex');
  });

  it('sets and resets tenant', async () => {
    const context = {
      client: {
        raw: jest.fn(),
      },
    };
    await handleWithTenant(
      context as unknown as Knex.QueryBuilder<any, any>,
      'tenantId'
    );
    expect(context.client.raw).toBeCalledTimes(2);
    expect(context.client.raw).toBeCalledWith('RESET nile.tenant_id');
    expect(context.client.raw).toBeCalledWith(
      "SET nile.tenant_id = 'tenantId'"
    );
  });
  it('resets tenant with a blank value', async () => {
    const context = {
      client: {
        raw: jest.fn(),
      },
    };
    await handleWithTenant(
      context as unknown as Knex.QueryBuilder<any, any>,
      null
    );
    expect(context.client.raw).toBeCalledTimes(1);
    expect(context.client.raw).toBeCalledWith('RESET nile.tenant_id');
  });
  it('sets and resets user', async () => {
    const context = {
      client: {
        raw: jest.fn(),
      },
    };
    await handleWithUser(
      context as unknown as Knex.QueryBuilder<any, any>,
      'userId'
    );
    expect(context.client.raw).toBeCalledTimes(2);
    expect(context.client.raw).toBeCalledWith('RESET nile.user_id');
    expect(context.client.raw).toBeCalledWith("SET nile.user_id = 'userId'");
  });
  it('resets user with a blank value', async () => {
    const context = {
      client: {
        raw: jest.fn(),
      },
    };
    await handleWithUser(
      context as unknown as Knex.QueryBuilder<any, any>,
      undefined
    );
    expect(context.client.raw).toBeCalledTimes(1);
    expect(context.client.raw).toBeCalledWith('RESET nile.user_id');
  });
});
