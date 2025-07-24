import { Routes } from '../../types';
import { urlMatches, proxyRoutes } from '../../utils/routes';
import request from '../../utils/request';
import { Config } from '../../../utils/Config';

const key = 'ERROR';
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
