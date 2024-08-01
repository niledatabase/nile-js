import { Routes } from '../../types';
import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import fetch from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';

const key = 'SIGNOUT';
export default async function route(request: Request) {
  let url = proxyRoutes[key];

  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === 'POST') {
    init.body = request.body;
    const [provider] = new URL(request.url).pathname.split('/').reverse();
    url = `${proxyRoutes[key]}/${provider}`;
  }

  const res = await fetch(url, { ...init, request });
  return res;
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
