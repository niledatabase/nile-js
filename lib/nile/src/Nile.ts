/**
 * dependencies need generated with `yarn build:api:gen`
 */

import {
  AccessApi,
  DevelopersApi,
  EntitiesApi,
  OrganizationsApi as OrgApi,
  UsersApi,
  WorkspacesApi as WorkspaceApi,
  MetricsApi,
  AuthApi,
} from './client/src';
import {
  Configuration,
  ConfigurationParameters,
  StorageOptions,
} from './client/src/runtime';
import EventsApi from './EventsApi';
import { AuthToken, DeveloperCredentials } from './model/DeveloperCredentials';
import { OrgProviders, organizationProviders } from './OrganizationsOidc';
import {
  SpaceProviders,
  workspaceLogout,
  workspaceProviders,
} from './WorkspaceOidc';

type OrganizationsApi = OrgApi & OrgProviders;
type WorkspacesApi = WorkspaceApi & SpaceProviders;

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
  auth: AuthApi;
  constructor(configuration?: Configuration) {
    this.config = configuration;

    // tack on org oidc
    const orgsProviders = organizationProviders(
      this.config?.basePath,
      this.config?.workspace
    );
    this.organizations = new OrgApi(configuration) as OrganizationsApi;
    this.organizations.oidc = orgsProviders;

    // tack on workspace oidc
    const worksProviders = workspaceProviders(
      this.config?.basePath,
      this.config?.workspace
    );
    this.workspaces = new WorkspaceApi(configuration) as WorkspacesApi;
    this.workspaces.oidc = {
      providers: worksProviders,
      logout: workspaceLogout(this.config?.basePath, this.config?.workspace),
    };

    this.users = new UsersApi(configuration);
    this.developers = new DevelopersApi(configuration);
    this.entities = new EntitiesApi(configuration);
    this.events = new EventsApi(this.entities);
    this.access = new AccessApi(configuration);
    this.metrics = new MetricsApi(configuration);
    this.auth = new AuthApi(configuration);

    // this needs to be last because setToken sets all classes
    if (this.config?.tokenStorage === StorageOptions.LocalStorage) {
      if (typeof window !== 'undefined') {
        if (this.config?.tokenStorage === StorageOptions.LocalStorage) {
          const token = localStorage.getItem('nileToken');
          if (token) {
            this.authToken = token;
          }
        }
      }
    }
  }

  /**
   * Sets the workspace. Workspaces are unique for a Nile instance. Set it once and it will be passed in all API calls for convenience
   */
  set workspace(workspace: void | string) {
    if (workspace) {
      const orgsProviders = organizationProviders(
        this.config?.basePath,
        workspace
      );
      this.organizations.oidc = orgsProviders;

      const worksProviders = workspaceProviders(
        this.config?.basePath,
        workspace
      );
      this.workspaces.oidc = {
        providers: worksProviders,
        logout: workspaceLogout(this.config?.basePath, this.config?.workspace),
      };

      this.organizations.workspace = workspace;
      this.users.workspace = workspace;
      this.developers.workspace = workspace;
      this.entities.workspace = workspace;
      this.workspaces.workspace = workspace;
      this.access.workspace = workspace;
      this.metrics.workspace = workspace;
      this.auth.workspace = workspace;
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
    if (this.auth.workspace) {
      return this.auth.workspace;
    }
  }

  /**
   * When a token is set, it is shared across all classes.
   */
  set authToken(token: void | string) {
    if (this.config?.tokenStorage === StorageOptions.LocalStorage) {
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('nileToken', token);
        } else {
          localStorage.setItem('nileToken', '');
        }
      }
    }
    this.users.authToken = token;
    this.developers.authToken = token;
    this.entities.authToken = token;
    this.workspaces.authToken = token;
    this.organizations.authToken = token;
    this.access.authToken = token;
    this.metrics.authToken = token;
    this.auth.authToken = token;
  }

  /**
   * For some calls, it may be necessary get then set an auth token to be sure all classes are authenticated
   * @returns the auth token if it has been set
   */
  get authToken(): void | string {
    if (this.config?.tokenStorage === StorageOptions.LocalStorage) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('nileToken');
        if (token) {
          return token;
        }
      }
    }
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
    if (this.auth.authToken) {
      return this.auth.authToken;
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
