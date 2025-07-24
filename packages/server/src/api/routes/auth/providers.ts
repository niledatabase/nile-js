import { Routes } from '../../types';
import { NileAuthRoutes, proxyRoutes, urlMatches } from '../../utils/routes';
import request from '../../utils/request';
import { Config } from '../../../utils/Config';
import { ctx } from '../../utils/request-context';

export default async function route(req: Request, config: Config) {
  return request(
    proxyRoutes(config.apiUrl).PROVIDERS,
    {
      method: req.method,
      request: req,
    },
    config
  );
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.PROVIDERS);
}

export async function fetchProviders(config: Config): Promise<Response> {
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${NileAuthRoutes.PROVIDERS}`;
  const { headers } = ctx.get();
  const req = new Request(clientUrl, {
    method: 'GET',
    headers,
  });

  return (await config.handlers.GET(req)) as Response;
}
