import {
  Configuration,
  ConfigurationParameters,
  UsersApi,
} from './client2/src';

export class DatabaseRestAPI {
  config?: Configuration;
  users: UsersApi;
  constructor(configuration?: Configuration) {
    this.config = configuration;
    this.users = new UsersApi(configuration);
  }
  /**
   * Sets the workspace. Workspaces are unique for a Nile instance. Set it once and it will be passed in all API calls for convenience
   */
  set workspace(workspace: void | string) {
    if (workspace) {
      this.users.workspace = workspace;
    }
  }
  get workspace(): void | string {
    return this.workspace ?? this.users.workspace;
  }

  set database(database: void | string) {
    if (database) {
      this.users.database = this.database = database;
    }
  }

  get database(): void | string {
    return this.database ?? this.users.database;
  }

  set tenantId(tenantId: void | string) {
    if (tenantId) {
      this.users.tenantId = this.tenantId = tenantId;
    }
  }

  get tenantId(): void | string {
    return this.tenantId ?? this.users.tenantId;
  }
}

export default function (config?: ConfigurationParameters): DatabaseRestAPI {
  if (!config) {
    return new DatabaseRestAPI();
  }

  const cfg = new Configuration(config);
  const nile = new DatabaseRestAPI(cfg);
  nile.workspace = cfg.workspace;
  nile.database = cfg.database;
  nile.tenantId = cfg.tenantId;
  return nile;
}
