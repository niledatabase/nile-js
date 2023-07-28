/* eslint-disable @typescript-eslint/no-explicit-any */
import 'knex';

type IdParam = null | void | string | { [key: string]: any; id: string };

declare module 'knex' {
  namespace Knex {
    export interface QueryBuilder {
      withTenant(param: IdParam): Knex.SchemaBuilder;
      withUser(param: IdParam): Knex.SchemaBuilder;
      client: Knex.Client;
    }
  }
}
