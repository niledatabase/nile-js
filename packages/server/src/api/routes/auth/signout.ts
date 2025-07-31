import { Routes } from '../../types';
import { NileAuthRoutes, proxyRoutes, urlMatches } from '../../utils/routes';
import fetch from '../../utils/request';
import { Config } from '../../../utils/Config';
import { ctx } from '../../utils/request-context';

const key = 'SIGNOUT';
export default async function route(request: Request, config: Config) {
  let url = proxyRoutes(config.apiUrl)[key];

  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === 'POST') {
    init.body = request.body;
    const [provider] = new URL(request.url).pathname.split('/').reverse();
    url = `${proxyRoutes(config.apiUrl)[key]}${
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
  const { headers } = ctx.get();
  const req = new Request(clientUrl, {
    method: 'POST',
    body,
    headers,
  });

  return (await config.handlers.POST(req)) as Response;
}
