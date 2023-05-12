import { Config } from '../utils/Config';

import { ResponseError } from './ResponseError';
import { _fetch } from './fetch';

export default class Requester extends Config {
  url: string;
  constructor(config: Config, url: string) {
    super(config);
    this.url = url;
  }

  protected async request(
    method: 'POST' | 'GET',
    req: Request,
    init?: RequestInit
  ): Promise<Response> {
    const body = await new Response(req.body).text();
    const res = await _fetch(this, this.url, {
      ...init,
      body,
      method,
      headers: {
        'content-type': 'application/json; charset=UTF8',
        ...init?.headers,
      },
    });
    if (res instanceof ResponseError) {
      return res.response;
    }
    return res;
  }
  post = async (req: Request, init?: RequestInit): Promise<Response> => {
    const resp = await this.request('POST', req, init);
    const text = await resp.text();
    return new Response(text, { status: resp.status, ...init });
  };
}
