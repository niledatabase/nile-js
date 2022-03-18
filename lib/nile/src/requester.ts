import { EntityType } from './NileConfig';
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
   * @type string
   */
  apiUrl: string;

  /**
   * @type {string} token for authorization
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
   * @returns @type {Promise<Response>}
   */
  fetch(
    method: 'POST' | 'GET',
    entity: EntityType,
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
