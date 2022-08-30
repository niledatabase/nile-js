/**
 * dependencies need generated with `yarn build:api:gen`
 */

import {
  AuthzApi,
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
import { AuthToken, DeveloperCredentials } from './model/DeveloperCredentials';

export class NileApi {
  users: UsersApi;
  developers: DevelopersApi;
  entities: EntitiesApi;
  workspaces: WorkspacesApi;
  organizations: OrganizationsApi;
  events: EventsApi;
  authz: AuthzApi;

  constructor(configuration?: Configuration) {
    this.users = new UsersApi(configuration);
    this.developers = new DevelopersApi(configuration);
    this.entities = new EntitiesApi(configuration);
    this.workspaces = new WorkspacesApi(configuration);
    this.organizations = new OrganizationsApi(configuration);
    this.events = new EventsApi(this.entities);
    this.authz = new AuthzApi(configuration);
  }

  set workspace(workspace: void | string) {
    if (workspace) {
      this.users.workspace = workspace;
      this.developers.workspace = workspace;
      this.entities.workspace = workspace;
      this.workspaces.workspace = workspace;
      this.organizations.workspace = workspace;
      this.authz.workspace = workspace;
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
    if (this.authz.workspace) {
      return this.authz.workspace;
    }
  }

  set authToken(token: void | string) {
    if (token) {
      this.users.authToken = token;
      this.developers.authToken = token;
      this.entities.authToken = token;
      this.workspaces.authToken = token;
      this.organizations.authToken = token;
      this.authz.authToken = token;
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
    if (this.authz.authToken) {
      return this.authz.authToken;
    }
  }
  /**
   * Creates a NileApi instance and connects using the provided credentials.
   * @example
   * ```typescript
   * import Nile from '@theniledev/js';
   *
   * const authToken = '2asdafsW4adaas.asdfas3asdadfsad';
   *
   * const nile = Nile({ apiUrl: 'http://localhost:8080', workspace: 'myWorkspace' }).connect(authToken);
   *
   * ```
   *
   * @param config - the NileApi configuration parameters
   * @param credentials - developer credentials; either a username and password or
   *   an auth token are required.
   * @returns NileApi
   */
  async connect(credentials: AuthToken | DeveloperCredentials) {
    if (typeof credentials === 'string') {
      this.authToken = credentials;
    } else {
      const token = await this.developers
        .loginDeveloper({
          loginInfo: {
            email: credentials.email || '',
            password: credentials.password || '',
          },
        })
        .catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('Nile authentication failed', error);
        });
      if (token) {
        this.authToken = token.token;
      }
    }
    return this;
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
