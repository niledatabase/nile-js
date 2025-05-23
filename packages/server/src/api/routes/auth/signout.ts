import { Routes } from '../../types';
import { NileAuthRoutes, proxyRoutes, urlMatches } from '../../utils/routes';
import fetch from '../../utils/request';
import { Config } from '../../../utils/Config';

const key = 'SIGNOUT';
export default async function route(request: Request, config: Config) {
  let url = proxyRoutes(config)[key];

  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === 'POST') {
    init.body = request.body;
    const [provider] = new URL(request.url).pathname.split('/').reverse();
    url = `${proxyRoutes(config)[key]}${
      provider !== 'signout' ? `/${provider}` : ''
    }`;
  }

  const res = await fetch(url, { ...init, request }, config);
  return res;
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchSignOut(
  config: Config,
  body: string
): Promise<Response> {
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${NileAuthRoutes.SIGNOUT}`;
  const req = new Request(clientUrl, {
    method: 'POST',
    body,
    headers: config.headers,
  });

  return (await config.handlers.POST(req)) as Response;
}
