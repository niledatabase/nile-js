import { urlMatches, proxyRoutes, NileAuthRoutes } from '../../utils/routes';
import request from '../../utils/request';
import { Routes } from '../../types';
import { Config } from '../../../utils/Config';
import { ctx } from '../../utils/request-context';

const key = 'MULTI_FACTOR';

export default async function route(req: Request, config: Config) {
  return request(
    proxyRoutes(config.apiUrl)[key],
    {
      method: req.method,
      request: req,
    },
    config
  );
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchMfa(
  config: Config,
  method: 'DELETE' | 'PUT' | 'POST',
  body: string
): Promise<Response> {
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${NileAuthRoutes.MULTI_FACTOR}`;
  const { headers } = ctx.get();
  const init: RequestInit = {
    headers,
    method,
    body,
  };

  const req = new Request(clientUrl, init);
  return (await config.handlers[method](req)) as Response;
}
