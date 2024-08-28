import { Routes } from '../../types';
import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import fetch from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Config } from '../../../utils/Config';

const key = 'SIGNOUT';
export default async function route(request: Request, config: Config) {
  let url = proxyRoutes(config)[key];

  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === 'POST') {
    init.body = request.body;
    const [provider] = new URL(request.url).pathname.split('/').reverse();
    url = `${proxyRoutes(config)[key]}/${provider}`;
  }

  const res = await fetch(url, { ...init, request });
  return res;
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
