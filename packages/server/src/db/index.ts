/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';

import { KnexConfig } from '../types';

type IdParam = null | void | string | { [key: string]: any; id: string };

export async function handleWithTenant(
  context: Knex.QueryBuilder<any, any>,
  tenantId: IdParam
) {
  await context.client.raw('RESET nile.tenant_id');
  if (tenantId) {
    const id = typeof tenantId === 'string' ? tenantId : tenantId.id;
    await context.client.raw(`SET nile.tenant_id = '${id}'`);
  }
  return context;
}

export async function handleWithUser(
  context: Knex.QueryBuilder<any, any>,
  userId: IdParam
) {
  await context.client.raw('RESET nile.user_id');
  if (userId) {
    const id = typeof userId === 'string' ? userId : userId.id;
    await context.client.raw(`SET nile.user_id = '${id}'`);
  }
  return context;
}

knex.QueryBuilder.extend('withTenant', async function withTenant(id: IdParam) {
  return await handleWithTenant(this, id);
});

knex.QueryBuilder.extend('withUser', async function withUser(id: IdParam) {
  return await handleWithUser(this, id);
});

class NileDB {
  knex: Knex;
  constructor(config: KnexConfig) {
    const dbConfig = {
      ...config,
      client: 'pg',
    };

    this.knex = knex(dbConfig);
  }
}

export default NileDB;
