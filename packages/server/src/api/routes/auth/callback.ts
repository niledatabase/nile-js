import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import fetch from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Routes } from '../../types';
import { Config } from '../../../utils/Config';
import Logger from '../../../utils/Logger';

const key = 'CALLBACK';

export default async function route(request: Request, config: Config) {
  const { error } = Logger(
    { ...config, debug: config.debug } as Config,
    '[ROUTES]',
    `[${key}]`
  );
  const [provider] = new URL(request.url).pathname.split('/').reverse();
  const passThroughUrl = new URL(request.url);
  const params = new URLSearchParams(passThroughUrl.search);
  const url = `${proxyRoutes(config).CALLBACK}/${provider}${
    params.toString() !== '' ? `?${params.toString()}` : ''
  }`;

  const res = await fetch(
    url,
    {
      request,
      method: request.method,
    },
    config
  ).catch((e) => {
    error('an error as occurred', e);
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
