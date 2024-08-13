import { Config } from '../Config';
import { ResponseError } from '../ResponseError';
import { X_NILE_TENANT, _fetch } from '../fetch';

export { NileResponse, NileRequest } from './types';

type Methods = 'DELETE' | 'POST' | 'GET' | 'PUT';
export default class Requester<T> extends Config {
  constructor(config: Config) {
    super(config);
  }

  async rawRequest(
    method: Methods,
    url: string,
    init: RequestInit,
    body?: string
  ): Promise<Response> {
    const _init = {
      ...init,
      body,
      method,
    };

    const res = await _fetch(this, url, _init);

    if (res instanceof ResponseError) {
      return res.response;
    }

    return res;
  }

  /**
   * three optios here
   * 1) pass in headers for a server side request
   * 2) pass in the payload that matches the api
   * 3) pass in the request object sent by a browser
   * @param method
   * @param url
   * @param req
   * @param init
   * @returns
   */
  protected async request(
    method: Methods,
    url: string,
    req: T | Headers,
    init?: RequestInit
  ): Promise<Response> {
    // set the headers
    const headers = new Headers(init ? init?.headers : {});
    if (req instanceof Headers) {
      const tenantId = req.get(X_NILE_TENANT);
      const cookie = req.get('cookie');
      if (tenantId) {
        headers.set(X_NILE_TENANT, tenantId);
      }
      if (cookie) {
        headers.set('cookie', cookie);
      }
    } else if (req instanceof Request) {
      // pass back the X_NILE_TENANT
      const _headers = new Headers(req?.headers);
      const tenantId = _headers.get(X_NILE_TENANT);
      const cookie = _headers.get('cookie');
      if (tenantId) {
        headers.set(X_NILE_TENANT, tenantId);
      }
      if (cookie) {
        headers.set('cookie', cookie);
      }
    }
    // default the body - may be the actual payload for the API
    let body: string | undefined = JSON.stringify(req);

    // comes from next/some server
    if (method === 'GET') {
      body = undefined;
    } else if (req instanceof Request) {
      body = await new Response(req.body).text();
    } else if (
      // is just headers for a GET request
      req instanceof Headers ||
      JSON.stringify(req) === '{}' ||
      (req && typeof req === 'object' && Object.values(req).length === 0)
    ) {
      body = undefined;
    }

    const _init = {
      ...init,
      headers,
    };

    return await this.rawRequest(method, url, _init, body);
  }

  post = async (
    req: T | Headers,
    url: string,
    init?: RequestInit
  ): Promise<Response> => {
    return await this.request('POST', url, req, init);
  };

  get = async (
    req: T | Headers,
    url: string,
    init?: RequestInit
  ): Promise<Response> => {
    return await this.request('GET', url, req, init);
  };

  put = async (
    req: T | Headers,
    url: string,
    init?: RequestInit
  ): Promise<Response> => {
    return await this.request('PUT', url, req, init);
  };

  delete = async (
    req: T | Headers,
    url: string,
    init?: RequestInit
  ): Promise<Response> => {
    return await this.request('DELETE', url, req, init);
  };
}
