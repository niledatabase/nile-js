import { Routes } from '../../types';
import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import request from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Config } from '../../../utils/Config';

const key = 'PASSWORD_RESET';
export default async function route(req: Request, config: Config) {
  const url = proxyRoutes(config)[key];

  const res = await request(
    url,
    {
      method: req.method,
      request: req,
    },
    config
  );

  const location = res?.headers.get('location');
  if (location) {
    return new Response(res?.body, {
      status: 302,
      headers: res?.headers,
    });
  }
  return new Response(res?.body, {
    status: res?.status,
    headers: res?.headers,
  });
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.PASSWORD_RESET);
}
