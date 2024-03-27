# @niledatabase/server

Consolidates the API and DB for working with Nile.

## Usage

### With configuration object

```ts
import Server from '@niledatabase/server';

const nile = Server({
  user: 'username',
  password: 'password',
});

await nile.api.createTenant({ name: 'name' })

await nile.db.("todo").withTenant('tenant-id');
```

### With env vars

```bash
NILEDB_USER=username
NILEDB_PASSWORD=password
```

```ts
import Server from '@niledatabase/server';

const nile = Server();

await nile.api.createTenant({ name: 'name' })

await nile.db.("todo").withTenant('tenant-id');
```

## Phone home

In addition to `user` and `password`, a fully configured SDK must also have values for `db.connection.host`, `databaseName`, and `databaseId`. If the values are not provided in either the `.env` file or the instance configuration, the SDK will automatically phone home to configure itself. For production, it is recommended to set those values.

## Configuration

Configuration passed to `Server` takes precedence over `.env` vars.

| Property           | Type          | .env var        | Description                                                                          |
| ------------------ | ------------- | --------------- | ------------------------------------------------------------------------------------ |
| databaseId         | `string`      | NILEDB_ID       | ID of the database.                                                                  |
| username           | `string`      | NILEDB_USER     | Username for database authentication.                                                |
| password           | `string`      | NILEDB_PASSWORD | Password for database authentication.                                                |
| databaseName       | `string`      | NILEDB_NAME     | Name of the database.                                                                |
| tenantId           | `string`      | NILEDB_TENANT   | ID of the tenant associated.                                                         |
| userId             | `string`      |                 | ID of the user associated.                                                           |
| db                 | `Knex.Config` |                 | Configuration object for [knex.js](https://knexjs.org/guide/#configuration-options). |
| db.connection.host | `string`      | NILEDB_HOST     | The host of the database. Default is `db.thenile.dev`.                               |
| db.connection.port | `number`      | NILEDB_PORT     | The port of the database. Default is `5432`.                                         |
| api                | `object`      |                 | Configuration object for API settings.                                               |
| api.basePath       | `string`      | NILEDB_API      | Base host for API for a specific region. Default is `api.thenile.dev`.               |
| api.cookieKey      | `string`      |                 | Key for API cookie. Default is `token`.                                              |
| api.token          | `string`      | NILEDB_TOKEN    | Token for API authentication. Mostly for debugging.                                  |
| debug              | `boolean`     |                 | Flag for enabling debug mode.                                                        |
