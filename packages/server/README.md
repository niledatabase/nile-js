# @niledatabase/server

Consolidates the API and DB for working with Nile.

## Usage

```ts
import Server from '@niledatabase/server';

const nile = Server({
  databaseId: String(process.env.NILE_DATABASE),
  db: {
    connection: {
      user: process.env.NILE_USER,
      password: process.env.NILE_PASSWORD,
    },
  },
});

await nile.api.createTenant({name: 'name'})

await nile.db.("todo").withTenant('tenant-id');
```
