/**
 * dependencies need generated with `yarn build:api:gen`
 */

import {
  AccessApi,
  DevelopersApi,
  EntitiesApi,
  OrganizationsApi,
  UsersApi,
  WorkspacesApi,
  MetricsApi,
} from './client/src';
import { Configuration, ConfigurationParameters } from './client/src/runtime';
import EventsApi from './EventsApi';
import { AuthToken, DeveloperCredentials } from './model/DeveloperCredentials';

/**
 * The base nile class. Pulls together groups of OpenAPI spec into a single class
 */
export class NileApi {
  config?: Configuration;
  users: UsersApi;
  developers: DevelopersApi;
  entities: EntitiesApi;
  workspaces: WorkspacesApi;
  organizations: OrganizationsApi;
  events: EventsApi;
  access: AccessApi;
  metrics: MetricsApi;
  constructor(configuration?: Configuration) {
    this.config = configuration;
    this.users = new UsersApi(configuration);
    this.developers = new DevelopersApi(configuration);
    this.entities = new EntitiesApi(configuration);
    this.workspaces = new WorkspacesApi(configuration);
    this.organizations = new OrganizationsApi(configuration);
    this.events = new EventsApi(this.entities);
    this.access = new AccessApi(configuration);
    this.metrics = new MetricsApi(configuration);
  }

  /**
   * Sets the workspace. Workspaces are unique for a Nile instance. Set it once and it will be passed in all API calls for convenience
   */
  set workspace(workspace: void | string) {
    if (workspace) {
      this.users.workspace = workspace;
      this.developers.workspace = workspace;
      this.entities.workspace = workspace;
      this.workspaces.workspace = workspace;
      this.organizations.workspace = workspace;
      this.access.workspace = workspace;
      this.metrics.workspace = workspace;
    }
  }

  /**
   * @returns the workspace, if it has been set
   */
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
    if (this.access.workspace) {
      return this.access.workspace;
    }
    if (this.metrics.workspace) {
      return this.metrics.workspace;
    }
  }

  /**
   * When a token is set, it is shared across all classes
   */
  set authToken(token: void | string) {
    if (token) {
      this.users.authToken = token;
      this.developers.authToken = token;
      this.entities.authToken = token;
      this.workspaces.authToken = token;
      this.organizations.authToken = token;
      this.access.authToken = token;
      this.metrics.authToken = token;
    }
  }

  /**
   * For some calls, it may be necessary get then set an auth token to be sure all classes are authenticated
   * @returns the auth token if it has been set
   */
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
    if (this.access.authToken) {
      return this.access.authToken;
    }
    if (this.metrics.authToken) {
      return this.metrics.authToken;
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

/**
 *
 * @param config
 * @returns A Nile instance
 */
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
