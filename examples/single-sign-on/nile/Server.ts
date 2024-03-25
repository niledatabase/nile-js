import Server from '@niledatabase/server';

const nile = Server({
  workspace: String(process.env.WORKSPACE),
  database: String(process.env.DATABASE),
});

export const { api, db } = nile;
export default nile;
