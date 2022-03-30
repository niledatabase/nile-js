import {
  NileConfig,
  NileSignIn,
  CreateableEntities,
  AuthResponse,
  ReadableEntities,
  UpdatableEntities,
  APIResponse,
} from './types';
import { Requester } from './requester';

const convertToJSON = (res: Response) => {
  if (res.ok === true) {
    try {
      return res.json();
    } catch (e) {
      console.error(e);
    }
  }
  // error of some kind
  return res;
};

class Nile {
  /**
   * URL for the client to request against.

   * @remarks
   * The value should be passed in the constructor
   * 
   * @type {string} a FQDN for https requests 
   * @defaultValue '/'
   * @readonly 
   */
  apiUrl: string;

  /**
   * auth token saved after login and re-used for requests aginst the backend
   * @type {string} token for authorization
   * @defaultValue null
   * @readonly
   */
  authToken: string | null;

  /**
   * A class wrapping `fetch` for making requests
   * @type {Requester} class to make requests
   */
  requester: Requester;

  /**
   * Creates a new instance of nile
   *
   * @remarks
   * The main nile client for API integration. One instance should be present for a given application.
   *
   * @param config - configuration for the nile client
   */
  constructor(config?: NileConfig) {
    this.apiUrl = config?.apiUrl ?? '/';
    this.authToken = null;
    this.requester = new Requester(this.apiUrl);
  }

  /**
   * this will go away when we have cookies
   * possibly necessary for node
   */
  setRequesterAuth() {
    if (!this.requester.authToken) {
      this.requester.setToken(this.authToken);
    }
  }

  /**
   * A function to be called for signing in
   * @param payload the email and password for a user
   * @returns {Promise<boolean>} was login successful
   */
  signIn(payload: NileSignIn): Promise<boolean> {
    return this.create('login', payload).then(res => {
      const { token } = ((res as unknown) as AuthResponse) ?? {};
      if (token) {
        this.authToken = token;
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
  create(entity: CreateableEntities, payload: unknown): Promise<APIResponse> {
    return this.requester.fetch('POST', entity, payload).then(convertToJSON);
  }

  /**
   * sends a GET request
   * @param entity strings mapped to the urls in the api
   * @returns {Promise<APIResponse>} the created entity
   */
  read(entity: ReadableEntities, id?: string | number): Promise<APIResponse> {
    let payload = entity;
    if (id) {
      payload = `${entity}/${id}` as ReadableEntities;
    }
    this.setRequesterAuth();
    return this.requester.fetch('GET', payload).then(convertToJSON);
  }

  /**
   * sends a POST request, with a payload.
   * @param entity strings mapped to the urls in the api
   * @param payload the id to update, or the maps to the payload types TODO
   * @returns {Promise<APIResponse>} the updated entity
   */
  update(
    entity: UpdatableEntities,
    payload: { id: string | number; [key: string]: unknown }
  ): Promise<APIResponse> {
    this.setRequesterAuth();
    const id = payload as { id: string };
    return this.requester
      .fetch('POST', `${entity}/${String(id)}`, payload)
      .then(convertToJSON);
  }

  /**
   * sends a DELETE request
   * @param entity maps to the urls in the api
   * @param payload the maps to the payload types TODO
   * @returns {Promise<APIResponse>} the deleted entity
   */
  remove(
    entity: UpdatableEntities,
    payload: string | number | { [key: string]: unknown }
  ): Promise<APIResponse> {
    this.setRequesterAuth();
    let id = payload;
    if (typeof id !== 'string') {
      id = payload as { id: string };
    }
    return this.requester
      .fetch('DELETE', `${entity}/${String(id)}`)
      .then(convertToJSON);
  }
}

export default Nile;
