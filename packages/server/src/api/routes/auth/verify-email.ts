import { Routes } from '../../types';
import { urlMatches, proxyRoutes, NileAuthRoutes } from '../../utils/routes';
import request from '../../utils/request';
import { Config } from '../../../utils/Config';

const key = 'VERIFY_EMAIL';
export default async function route(req: Request, config: Config) {
  const url = proxyRoutes(config)[key];

  const res = await request(
    url,
    {
      method: req.method,
      request: req,
    },
    config
  );

  const location = res?.headers?.get('location');
  if (location) {
    return new Response(res?.body, {
      status: 302,
      headers: res?.headers,
    });
  }
  return new Response(res?.body, {
    status: res?.status,
    headers: res?.headers,
  });
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchVerifyEmail(
  config: Config,
  method: 'POST' | 'GET',
  body?: string
): Promise<Response> {
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${NileAuthRoutes.VERIFY_EMAIL}`;
  const init: RequestInit = {
    method,
    headers: config.headers,
  };
  if (body) {
    init.body = body;
  }
  const req = new Request(clientUrl, init);

  return (await config.handlers[method](req)) as Response;
}
