import Server from '@theniledev/server';

export const api = new Server({
  workspace: String(process.env.NEXT_PUBLIC_WORKSPACE),
  database: String(process.env.NEXT_PUBLIC_DATABASE),
  basePath: String(process.env.BASE_PATH),
});
