import { Routes } from '../../types';
import { NileAuthRoutes, proxyRoutes, urlMatches } from '../../utils/routes';
import request from '../../utils/request';
import { Config } from '../../../utils/Config';

export default async function route(req: Request, config: Config) {
  return request(
    proxyRoutes(config).PROVIDERS,
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
  const clientUrl = `${config.origin}${config.routePrefix}${NileAuthRoutes.PROVIDERS}`;
  const req = new Request(clientUrl, {
    method: 'GET',
    headers: config.headers,
  });

  return (await config.handlers.GET(req)) as Response;
}
