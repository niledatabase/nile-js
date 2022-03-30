import {
  CreateableEntities,
  ReadableEntities,
  UpdatableEntities,
} from './types';

const requestHeaders = (authToken: string | null) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
};

export class Requester {
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

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    this.authToken = null;
  }
  setToken(token: string | null) {
    this.authToken = token;
  }
  /**
   *
   * @param method method to call
   * @param entity entity to affect
   * @param payload json object to use
   * @returns {Promise<Response>}
   */
  fetch(
    method: 'POST' | 'GET' | 'DELETE',
    entity: CreateableEntities | ReadableEntities | UpdatableEntities,
    payload?: unknown
  ): Promise<Response> {
    const headers = requestHeaders(this.authToken);
    return fetch(`${this.apiUrl}/${entity}`, {
      headers,
      method,
      body: JSON.stringify(payload),
    });
  }
}
