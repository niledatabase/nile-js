<p align="center">
  <img width="1434" alt="Screen Shot 2024-09-18 at 9 20 04 AM" src="https://github.com/user-attachments/assets/20585883-5cdc-4f15-93d3-dc150e87bc11">
</p>

---

# Nile's Server-Side SDK

This package (`@niledatabase/server`) is part of [Nile's Javascript SDK](https://github.com/niledatabase/nile-js/tree/main).

Nile's server-side Javascript package provides:

- 🔐 Methods for working with Nile's user and tenant APIs
- 🔑 Generated routes for authentication
- 🔍 SQL query execution with tenant and user context management

**Nile is a Postgres platform that decouples storage from compute, virtualizes tenants, and supports vertical and horizontal scaling globally to ship B2B applications fast while being safe with limitless scale.** All B2B applications are multi-tenant. A tenant/customer is primarily a company, an organization, or a workspace in your product that contains a group of users. A B2B application provides services to multiple tenants. Tenant is the basic building block of all B2B applications.

## Usage

### Installation

```ts
npm install @niledatabase/server 
```

### Initialize SDK with env vars

The recommended way to initialize Nile SDK is with `.env` file. You can copy the environment variables from [Nile console](https://console.thenile.dev). It should look similar to this:

```bash
NILEDB_USER=username
NILEDB_PASSWORD=password
NILEDB_API_URL=https://us-west-2.api.thenile.dev/v2/databases/DBID
NILEDB_POSTGRES_URL=postgres://us-west-2.db.thenile.dev:5432/dbname
```

```ts
import Nile from '@niledatabase/server';

const nile = await Nile();
```

### Initialize SDK with configuration object

```ts
import Nile from '@niledatabase/server';

const nile = await Nile({
  user: 'username',
  password: 'password',
  debug: true
});
```

### Call Nile APIs

```typescript
const tenant = await nile.api.tenants.createTenant(tenantName);
if (tenant instanceof Response) {
  const err = await tenant.text()
  console.log("ERROR creating tenant: ", tenant, err);
  return { message: "Error creating tenant" };
}
nile.tenant_id = tenant.id // set context
// Get tenant name doesn't need any input parameters 
// because it uses the tenant ID and user token from the context
const checkTenant = await tenantNile.api.tenants.getTenant();
```

### Query the database

```typescript
  nile.tenant_id = tenant.id // set context

  const todos = await nile.db
    .query("select * from todos order by title")
    .catch((e: Error) => {
      console.error(e);
    }); // no need for where clause if you previously set Nile context
```

## Initialization

In addition to `user` and `password`, a fully configured SDK must also have values for `db.host`, `databaseName`, and `databaseId`. If the values are not provided in either the `.env` file or the instance configuration, the `init()` function should be called, which will allow the SDK to automatically configure itself. For production, it is recommended to set those values.

## Configuration

Configuration passed to `Server` takes precedence over `.env` vars.

| Property      | Type         | .env var        | Description                                                              |
| ------------- | ------------ | --------------- | ------------------------------------------------------------------------ |
| user          | `string`     | NILEDB_USER     | Required. Username for database authentication.                          |
| password      | `string`     | NILEDB_PASSWORD | Required. Password for database authentication.                          |
| databaseId    | `string`     | NILEDB_ID       | ID of the database.                                                      |
| databaseName  | `string`     | NILEDB_NAME     | Name of the database.                                                    |
| tenantId      | `string`     | NILEDB_TENANT   | ID of the tenant associated.                                             |
| userId        | `string`     |                 | ID of the user associated.                                               |
| db            | `PoolConfig` |                 | Configuration object for [pg.Pool](https://node-postgres.com/apis/pool). |
| db.host       | `string`     | NILEDB_HOST     | Base host for DB. Defaut is `db.thenile.dev`                             |
| api           | `object`     |                 | Configuration object for API settings.                                   |
| api.basePath  | `string`     | NILEDB_API_URL  | Base host for API for a specific region.                                 |
| api.cookieKey | `string`     |                 | Key for API cookie. Default is `token`.                                  |
| api.token     | `string`     | NILEDB_TOKEN    | Token for API authentication. Mostly for debugging.                      |
| debug         | `boolean`    |                 | Flag for enabling debug logging.                                         |

## Learn more

- You can learn more about Nile and the SDK in [https://thenile.dev/docs]
- You can find detailed code examples in [our main repo](https://github.com/niledatabase/niledatabase)
- Nile SDK interacts with APIs in Nile Auth service. You can learn more about it in the [repository](https://github.com/niledatabase/nile-auth) and the [docs](https://thenile.dev/docs/auth)