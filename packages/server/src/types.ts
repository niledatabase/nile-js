export type Opts = {
  basePath?: string;
  fetch?: typeof fetch;
};

export type ServerConfig = {
  basePath?: string;
  cookieKey?: string;
  database: string;
  tenantId?: string;
  workspace: string;
};
