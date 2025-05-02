import { Routes } from '../../types';
import {
  ProxyNileAuthRoutes,
  proxyRoutes,
} from '../../utils/routes/proxyRoutes';
import request from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Config } from '../../../utils/Config';

export default async function route(req: Request, config: Config) {
  return request(
    proxyRoutes(config).CSRF,
    {
      method: req.method,
      request: req,
    },
    config
  );
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.CSRF);
}

export async function fetchCsrf(config: Config): Promise<Response> {
  const clientUrl = `${config.origin}${config.routePrefix}${ProxyNileAuthRoutes.CSRF}`;
  const req = new Request(clientUrl, {
    method: 'GET',
    headers: config.headers,
  });

  return (await config.handlers.GET(req)) as Response;
}
