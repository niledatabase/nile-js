import {
  NileSignIn,
  CreateableEntities,
  AuthResponse,
  ReadableEntities,
  UpdatableEntities,
} from './types';
/**
 * the below files need generated with `yarn build:exp`
 */
import { DefaultApiRequestFactory } from './generated/openapi/apis/DefaultApi';
import { HttpMethod, RequestContext } from './generated/openapi/http/http';
import { Configuration, createConfiguration, ConfigurationParameters } from './generated/openapi/configuration';
import { ObjectSerializer } from './generated/openapi/models/ObjectSerializer';
import { ServerConfiguration } from './generated/openapi/servers';
import { SecurityAuthentication, AuthMethods } from './generated/openapi/auth/auth';
let authToken = '';

export class NileService extends DefaultApiRequestFactory {
  /**
   * Creates a new instance of nile
   * The main nile client for API integration. One instance should be present for a given application.
   *
   * @param config - configuration for the nile client
   */
  constructor(config: Configuration) {
    super(config);
  }

  /**
   * A function to be called for signing in
   * @param payload the email and password for a user
   * @returns a promise indicating if login was successful
   */
  public async signIn(payload: NileSignIn): Promise<boolean> {
    return this.create('login', payload).then(res => {
      const { token } = ((res as unknown) as AuthResponse) ?? {};
      if (token) {
        // this creates a new instance internally
        authToken = token;
        return true;
      }
      return false;
    });
  }

  /**
   * Sends a POST to the be with a payload
   *
   * @param entity maps to urls in the api
   * @param payload the maps to the payload types TODO
   * @returns a promise for the created entity
   */
  public async create(entity: CreateableEntities, payload: unknown): Promise<RequestContext> {
    return this.buildOpenApiRequest(`/${entity}`, HttpMethod.POST, payload);
  }

  async buildOpenApiRequest(entity: CreateableEntities, method: HttpMethod, payload?: unknown): Promise<RequestContext> {
    const requestContext = this.configuration.baseServer.makeRequestContext(`/${entity}`, method);
    requestContext.setHeaderParam('Accept', 'application/json, */*;q=0.8')

    // if we are a POST
    if (payload) {
      const serializedBody = ObjectSerializer.stringify(payload, 'application/json');
      requestContext.setBody(serializedBody);
    }

    // if we are authenticated
    const defaultAuth: SecurityAuthentication | undefined = this.configuration?.authMethods?.default
    if (defaultAuth?.applySecurityAuthentication) {
      await defaultAuth?.applySecurityAuthentication(requestContext);
    }

    return requestContext;

  }
  /**
   * sends a GET request
   * @param entity strings mapped to the urls in the api
   * @returns {Promise<RequestContext>} the created entity
   */
  public async read(entity: ReadableEntities, id?: string | number): Promise<RequestContext> {
    let url = entity;
    if (id) {
      url = `/${entity}/${id}` as ReadableEntities;
    }
    return this.buildOpenApiRequest(url, HttpMethod.GET);
  }

  /**
   * sends a POST request, with a payload.
   * @param entity strings mapped to the urls in the api
   * @param payload the id to update, or the maps to the payload types TODO
   * @returns {Promise<RequestContext>} the updated entity
   */
  public async update(
    entity: UpdatableEntities,
    payload: { id: string | number;[key: string]: unknown }
  ): Promise<RequestContext> {
    const id = payload as { id: string };
    const url = `/${entity}/${String(id)}`;
    return this.buildOpenApiRequest(url, HttpMethod.POST, payload);
  }

  /**
   * sends a DELETE request
   * @param entity maps to the urls in the api
   * @param payload the maps to the payload types TODO
   * @returns {Promise<RequestContext>} the deleted entity
   */
  public async remove(
    entity: UpdatableEntities,
    payload: string | number | { [key: string]: unknown }
  ): Promise<RequestContext> {
    let id = payload;
    if (typeof id !== 'string') {
      id = payload as { id: string };
    }
    const url = `/${entity}/${String(id)}`;
    return this.buildOpenApiRequest(url, HttpMethod.DELETE);
  }
}

function ApiImpl(config?: ConfigurationParameters & { apiUrl: string }): NileService {
  const authentication: AuthMethods = {
    default: {
      getName: (): string => 'Bearer Authentication',
      applySecurityAuthentication: (requestContext): void => {
        requestContext.setHeaderParam('Authorization', `Bearer ${authToken}`);
      }
    }
  }
  const server = new ServerConfiguration<{ [key: string]: string }>(config?.apiUrl ?? '/', {})
  const _config = {
    baseServer: server,
    authMethods: authentication,
    ...config,
  };
  const cfg = createConfiguration(_config);
  const nile = new NileService(cfg);
  return nile;
}
export default ApiImpl;
