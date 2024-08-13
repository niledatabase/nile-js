import { Routes } from '../../types';
import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import request from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Config } from '../../../utils/Config';

export default async function route(req: Request, config: Config) {
  return request(
    proxyRoutes.SESSION,
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
