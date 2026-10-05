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

### Vercel Marketplace OIDC pilot

The `@niledatabase/server/vercel` entry is available in this source branch. Use it
only with a published SDK release that includes this entry and a Nile resource
that has completed OIDC enablement. Existing SDK releases do not gain this feature
by changing environment variables. The helper requires Node 20 or later and
`@vercel/oidc`.

```ts
import { Nile } from '@niledatabase/server';
import { createVercelConfig } from '@niledatabase/server/vercel';

const nile = Nile(
  createVercelConfig({
    loginId: process.env.NILEDB_OIDC_LOGIN_ID!,
    databaseId: process.env.NILEDB_ID!,
    databaseName: process.env.NILEDB_NAME!,
    host: process.env.NILEDB_HOST!,
    apiUrl: process.env.NILEDB_API_URL!,
    vercelResourceId: process.env.NILEDB_VERCEL_RESOURCE_ID!,
  })
);
```

`NILEDB_OIDC_LOGIN_ID` is the dedicated login ID supplied by Nile.
`NILEDB_VERCEL_RESOURCE_ID` is the Vercel integration resource ID; a Nile database
UUID cannot replace it.
These settings contain no database password. Use the published database DNS
hostname. The helper supplies `ssl: { rejectUnauthorized: true }` and rejects
plaintext, certificate-verification overrides, IP hosts, and competing connection
strings before acquiring a token. An optional `ca` supplies an explicitly trusted
certificate authority.

Creating the instance does not mint a token. After the gateway advertises
`OAUTHBEARER` over certificate-verified TLS, each new physical connection obtains
the current workload identity through `@vercel/oidc`, then requests a resource
token without a role parameter. The client uses PostgreSQL 18's RFC 7628 SASL
`OAUTHBEARER` transport. Returned expiry fields are validated;
the helper does not cache tokens or use a five-minute refresh timer. Missing
identity, denied minting, timeout, malformed responses, and invalid certificates
fail the connection. Cleartext, MD5, SCRAM, and trust authentication are rejected
before minting. There is no password or plaintext retry.

A module-level instance may serve later requests. Tokens are requested in the
`oauthBearerToken` provider, not during a build or import. Passing
`oauthBearerToken` creates a separate Nile instance. Create it once and reuse it
for that resource.
Keep each instance bound to one database, login, token provider, TLS configuration,
and `Client`. Tenant and application-user context continue to use Nile's existing APIs.

The helper returns `oauthBearerToken` at the top level and in `db`, together with
`db.Client: OAuthBearerClient`. For direct node-postgres use:

```ts
import pg from 'pg';
import { createVercelConfig } from '@niledatabase/server/vercel';

const config = createVercelConfig(options);
const pool = new pg.Pool({
  ...config.db,
  user: config.user,
  database: config.databaseName,
});
```

Custom token providers use `(signal: AbortSignal) => string | Promise<string>`.
The client aborts the signal when the connection ends. A late token cannot
authenticate a retired connection. `OAuthBearerClient` is also exported from
the Node-only `/vercel` entry for applications with their own provider.

Once an application uses OIDC, retain OIDC-capable gateways and identity renewal
even while the resource is in dual mode. A password-only application rollback
requires an explicit redeployment with still-valid password configuration.

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

Configure `user` and either `password` or `oauthBearerToken`. A fully configured SDK also uses `db.host`, `databaseName`, and `databaseId`. If the values are not provided in either the `.env` file or the instance configuration, the `init()` function should be called, which will allow the SDK to automatically configure itself. For production, it is recommended to set those values.

## Configuration

Configuration passed to `Server` takes precedence over `.env` vars.

| Property         | Type                       | .env var        | Description                                                                                            |
| ---------------- | -------------------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| user             | `string`                   | NILEDB_USER     | Required. Username for database authentication.                                                        |
| password         | `string` or callback       | NILEDB_PASSWORD | Password authentication. A callback supplies a fresh password for each new pg connection.              |
| oauthBearerToken | `OAuthBearerTokenProvider` |                 | OAUTHBEARER authentication over verified TLS. Cannot be combined with `password`.                      |
| databaseId       | `string`                   | NILEDB_ID       | ID of the database.                                                                                    |
| databaseName     | `string`                   | NILEDB_NAME     | Name of the database.                                                                                  |
| tenantId         | `string`                   | NILEDB_TENANT   | ID of the tenant associated.                                                                           |
| userId           | `string`                   |                 | ID of the user associated.                                                                             |
| db               | `NilePoolConfig`           |                 | Configuration object for [pg.Pool](https://node-postgres.com/apis/pool), including `oauthBearerToken`. |
| db.host          | `string`                   | NILEDB_HOST     | Base host for DB. Defaut is `db.thenile.dev`                                                           |
| api              | `object`                   |                 | Configuration object for API settings.                                                                 |
| api.basePath     | `string`                   | NILEDB_API_URL  | Base host for API for a specific region.                                                               |
| api.cookieKey    | `string`                   |                 | Key for API cookie. Default is `token`.                                                                |
| api.token        | `string`                   | NILEDB_TOKEN    | Token for API authentication. Mostly for debugging.                                                    |
| debug            | `boolean`                  |                 | Flag for enabling debug logging.                                                                       |

## Learn more

- You can learn more about Nile and the SDK in [https://thenile.dev/docs]
- You can find detailed code examples in [our main repo](https://github.com/niledatabase/niledatabase)
- Nile SDK interacts with APIs in Nile Auth service. You can learn more about it in the [repository](https://github.com/niledatabase/nile-auth) and the [docs](https://thenile.dev/docs/auth)