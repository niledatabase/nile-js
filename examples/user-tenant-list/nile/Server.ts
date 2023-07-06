import Server from '@theniledev/server';

const nile = new Server({
  workspace: String(process.env.NEXT_PUBLIC_WORKSPACE),
  database: String(process.env.NEXT_PUBLIC_DATABASE),
  api: {
    basePath: String(process.env.BASE_PATH),
  },
  db: {
    connection: {
      user: process.env.NILE_USER,
      password: process.env.NILE_PASSWORD,
      host: process.env.NILE_HOST,
    },
  },
});
export default nile;

export const db = nile.db;

export const api = nile.api;
