/**
 * dependencies need generated with `yarn build:api:gen`
 */
import {
  DevelopersApi,
  EntitiesApi,
  InstanceEvent,
  OrganizationsApi,
  UsersApi,
  WorkspacesApi,
} from './generated/openapi/src';
import {
  Configuration,
  ConfigurationParameters,
} from './generated/openapi/src/runtime';

export class EventsApi {
  static onCounter = 0;
  entities: EntitiesApi;
  timers: { [key: number]: ReturnType<typeof setTimeout> };

  constructor(entities: EntitiesApi) {
    this.entities = entities;
    this.timers = {};
  }

  on(
    options: { type: string; seq: any },
    listener: (event: InstanceEvent) => Promise<void>,
    refresh = 5000
  ): number {
    const id = EventsApi.onCounter++;
    let seq = options.seq;
    const getEvents = async () => {
      const events = await this.entities.instanceEvents({
        type: options.type,
        seq,
      });
      if (events) {
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          if (event) {
            await listener(event);
            if (seq == null || (event?.after?.seq || seq) > seq) {
              seq = event?.after?.seq || seq;
            }
          }
        }
      }
      const timer = setTimeout(getEvents, refresh);
      this.timers[id] = timer;
    };
    const timer = setTimeout(getEvents, 0);
    this.timers[id] = timer;
    return id;
  }

  cancel(id: number): void {
    const timer = this.timers[id];
    if (timer) {
      clearTimeout(timer);
      delete this.timers[id];
    }
  }
}

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
