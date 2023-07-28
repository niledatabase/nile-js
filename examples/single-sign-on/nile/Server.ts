import Server from '@theniledev/server';

const nile = Server({
  workspace: String(process.env.WORKSPACE),
  database: String(process.env.DATABASE),
  api: {
    basePath: 'http://localhost:8080',
  },
});

export const { api, db } = nile;
export default nile;
