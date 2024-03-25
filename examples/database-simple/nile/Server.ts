import Server from '@niledatabase/server';

export const { api, db } = new Server({
  workspace: String(process.env.NILE_WORKSPACE),
  database: String(process.env.NILE_DATABASE),
  api: {
    basePath: String(process.env.BASE_PATH),
  },
  db: {
    connection: {
      user: process.env.NILE_USER,
      password: process.env.NILE_PASSWORD,
    },
  },
});
