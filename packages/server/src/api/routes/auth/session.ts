import { Routes } from '../../types';
import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import request from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';

export default async function route(req: Request) {
  return request(proxyRoutes.SESSION, {
    method: req.method,
    request: req,
  });
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.SESSION);
}
