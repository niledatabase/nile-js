/**
 * dependencies need generated with `yarn build:api:gen`
 */
import {
  DevelopersApi,
  EntitiesApi,
  OrganizationsApi,
  UsersApi,
  WorkspacesApi,
} from './generated/openapi/src';
import {
  Configuration,
  ConfigurationParameters,
} from './generated/openapi/src/runtime';
import EventsApi from './EventsApi';

export class NileApi {
  users: UsersApi;
  developers: DevelopersApi;
  entities: EntitiesApi;
  workspaces: WorkspacesApi;
  organizations: OrganizationsApi;
  events: EventsApi;
  constructor(configuration?: Configuration) {
    this.users = new UsersApi(configuration);
    this.developers = new DevelopersApi(configuration);
    this.entities = new EntitiesApi(configuration);
    this.workspaces = new WorkspacesApi(configuration);
    this.organizations = new OrganizationsApi(configuration);
    this.events = new EventsApi(this.entities);
  }

  set workspace(workspace: void | string) {
    if (workspace) {
      this.users.workspace = workspace;
      this.developers.workspace = workspace;
      this.entities.workspace = workspace;
      this.workspaces.workspace = workspace;
      this.organizations.workspace = workspace;
    }
  }

  get workspace(): void | string {
    if (this.users.workspace) {
      return this.users.workspace;
    }
    if (this.developers.workspace) {
      return this.developers.workspace;
    }
    if (this.entities.workspace) {
      return this.workspaces.workspace;
    }
    if (this.workspaces.workspace) {
      return this.workspaces.workspace;
    }
    if (this.organizations.workspace) {
      return this.organizations.workspace;
    }
  }

  set authToken(token: void | string) {
    if (token) {
      this.users.authToken = token;
      this.developers.authToken = token;
      this.entities.authToken = token;
      this.workspaces.authToken = token;
      this.organizations.authToken = token;
    }
  }

  get authToken(): void | string {
    if (this.users.authToken) {
      return this.users.authToken;
    }
    if (this.developers.authToken) {
      return this.developers.authToken;
    }
    if (this.entities.authToken) {
      return this.workspaces.authToken;
    }
    if (this.workspaces.authToken) {
      return this.workspaces.authToken;
    }
    if (this.organizations.authToken) {
      return this.organizations.authToken;
    }
  }
}

function ApiImpl(config?: ConfigurationParameters): NileApi {
  if (!config) {
    return new NileApi();
  }

  const cfg = new Configuration(config);
  const nile = new NileApi(cfg);
  nile.workspace = cfg.workspace;
  return nile;
}
export default ApiImpl;
