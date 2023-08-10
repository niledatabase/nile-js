import Server from '@theniledev/server';

const nile = Server({
  workspace: String(process.env.WORKSPACE),
  database: String(process.env.DATABASE),
  api: {
    basePath: String(process.env.NILE_BASE_PATH),
  },
});

export const { api, db } = nile;
export default nile;
