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
    proxyRoutes(config).SESSION,
    {
      method: req.method,
      request: req,
    },
    config
  );
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.SESSION);
}

export async function fetchSession(config: Config): Promise<Response> {
  const clientUrl = `${config.origin}${config.routePrefix}${ProxyNileAuthRoutes.SESSION}`;
  const req = new Request(clientUrl, {
    method: 'GET',
    headers: config.headers,
  });

  return (await config.handlers.GET(req)) as Response;
}
