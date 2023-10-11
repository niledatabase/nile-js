/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';

type IdParam = null | void | string | { [key: string]: any; id: string };

export async function handleWithTenant(
  context: Knex.QueryBuilder,
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
  context: Knex.QueryBuilder,
  tenantId: IdParam,
  userId: IdParam
) {
  await handleWithTenant(context, tenantId);
  await context.client.raw('RESET nile.user_id');
  if (userId) {
    const id = typeof userId === 'string' ? userId : userId.id;
    await context.client.raw(`SET nile.user_id = '${id}'`);
  }
  return context;
}

export function extendKnex() {
  try {
    /*
     * takes a tenant id and sets the context
     */
    knex.QueryBuilder.extend(
      'withTenant',
      async function withTenant(id: IdParam) {
        return await handleWithTenant(this, id);
      }
    );

    /*
     * takes a tenant id and user id and sets the context
     */
    knex.QueryBuilder.extend(
      'withUser',
      async function withUser(tenantId: IdParam, userId: IdParam) {
        return await handleWithUser(this, tenantId, userId);
      }
    );
  } catch (e) {
    // let this fail silently, we have already added these methods - probably in dev mode
  }
}

export default knex;
