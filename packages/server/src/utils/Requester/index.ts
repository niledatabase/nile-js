import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

import { Config } from '../Config';
import { ResponseError } from '../ResponseError';
import { _fetch } from '../fetch';

export { NileResponse, NileRequest } from './types';

type Methods = 'POST' | 'GET' | 'PUT';
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
    const _init = init ?? {};
    if (req instanceof Headers) {
      _init.headers = req;
    } else if (req instanceof Request) {
      _init.headers = new Headers(req?.headers);
    }
    // default the body - may be the actual payload for the API
    let body: string | undefined = JSON.stringify(req);

    // comes from next/some server
    if (req instanceof Request) {
      body = await new Response(req.body).text();
    } else if (
      // is just headers for a GET request
      req instanceof Headers ||
      isEmpty(req) ||
      (isObject(req) && Object.values(req).length === 0)
    ) {
      body = undefined;
    }
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
}
