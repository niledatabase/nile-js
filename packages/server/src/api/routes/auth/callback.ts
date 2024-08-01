import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import fetch from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Routes } from '../../types';

const { log, error } = console;
export default async function route(request: Request) {
  const [provider] = new URL(request.url).pathname.split('/').reverse();
  const passThroughUrl = new URL(request.url);
  const params = new URLSearchParams(passThroughUrl.search);
  const url = `${proxyRoutes.CALLBACK}/${provider}${
    params.toString() !== '' ? `?${params.toString()}` : ''
  }`;

  const res = await fetch(url, {
    request,
    method: request.method,
  }).catch((e) => {
    error('an error has occurred in callback');
    log(e);
  });

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
  return urlMatches(request.url, configRoutes.CALLBACK);
}
