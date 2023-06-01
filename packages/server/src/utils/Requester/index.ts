import { Config } from '../Config';
import { ResponseError } from '../ResponseError';
import { _fetch } from '../fetch';

export { NileResponse, NileRequest } from './types';

export default class Requester<T> extends Config {
  constructor(config: Config) {
    super(config);
  }

  async rawRequest(
    method: 'POST' | 'GET',
    url: string,
    body: string,
    init?: RequestInit
  ): Promise<Response> {
    const _init = {
      ...init,
      body,
      method,
      headers: {
        'content-type': 'application/json; charset=UTF8',
        ...init?.headers,
      },
    };
    const res = await _fetch(this, url, _init);
    if (res instanceof ResponseError) {
      return res.response;
    }
    return res;
  }

  protected async request(
    method: 'POST' | 'GET',
    url: string,
    req: T,
    init?: RequestInit
  ): Promise<Response> {
    if (req instanceof Request) {
      const body = await new Response(req.body).text();
      return this.rawRequest(method, url, body, init);
    }
    return this.rawRequest('POST', url, JSON.stringify(req), init);
  }

  post = async (req: T, url: string, init?: RequestInit): Promise<Response> => {
    return await this.request('POST', url, req, init);
  };
}
