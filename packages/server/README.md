# @niledatabase/server

Consolidates the API and DB for working with Nile.

## Usage

### With configuration object

```ts
import Nile from '@niledatabase/server';

const nile = new Nile({
  user: 'username',
  password: 'password',
});

await nile.init();

await nile.api.createTenant({ name: 'name' });

await nile.db.query('select * from todo');
```

### With env vars

```bash
NILEDB_USER=username
NILEDB_PASSWORD=password
```

```ts
import Nile from '@niledatabase/server';

const nile = new Nile();

await nile.init();

await nile.api.createTenant({ name: 'name' });

await nile.db.query('select * from todo');
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
| api.basePath  | `string`     | NILEDB_API      | Base host for API for a specific region. Default is `api.thenile.dev`.   |
| api.cookieKey | `string`     |                 | Key for API cookie. Default is `token`.                                  |
| api.token     | `string`     | NILEDB_TOKEN    | Token for API authentication. Mostly for debugging.                      |
| debug         | `boolean`    |                 | Flag for enabling debug logging.                                         |
