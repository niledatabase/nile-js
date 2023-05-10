import { Config } from '../utils/Config';

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
    });
    return res;
  }
  post = async (req: Request, init?: RequestInit): Promise<Response> => {
    return this.request('POST', req, init);
  };
}
