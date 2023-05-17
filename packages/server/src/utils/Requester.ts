import { Config } from '../utils/Config';

import { ResponseError } from './ResponseError';
import { _fetch } from './fetch';

export default class Requester extends Config {
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
    req: Request,
    init?: RequestInit
  ): Promise<Response> {
    const body = await new Response(req.body).text();
    return this.rawRequest(method, url, body, init);
  }

  post = async (
    req: Request,
    url: string,
    init?: RequestInit
  ): Promise<Response> => {
    const resp = await this.request('POST', url, req, init);
    const text = await resp.text();
    return new Response(text, { status: resp.status, ...init });
  };
}
