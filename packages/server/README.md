# @niledatabase/server

Consolidates the API and DB for working with Nile.

## Usage

```ts
import Server from '@niledatabase/server';

const connection = {
  user: process.env.NILE_USER,
  password: process.env.NILE_PASSWORD,
  host: process.env.NILE_DB_HOST,
};
const nile = Server({
  database: String(process.env.NILE_DATABASE),
  api: {
    basePath: String(process.env.BASE_PATH),
  },
  db: {
    connection,
  },
});

await nile.api.createTenant({name: 'name'})

await nile.db.("todo").withTenant('tenant-id');
```
