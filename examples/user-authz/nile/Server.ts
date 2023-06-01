import Server from '@theniledev/server';

export const { api, db } = new Server({
  workspace: String(process.env.NEXT_PUBLIC_WORKSPACE),
  database: String(process.env.NEXT_PUBLIC_DATABASE),
  api: {
    basePath: String(process.env.BASE_PATH),
  },
  db: {
    connection: {
      host: process.env.NILE_HOST,
      user: process.env.NILE_USER,
      password: process.env.NILE_PASSWORD,
    },
  },
});
