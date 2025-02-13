import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import request from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';
import { Routes } from '../../types';
import { Config } from '../../../utils/Config';
import Logger from '../../../utils/Logger';

const key = 'CALLBACK';

export default async function route(req: Request, config: Config) {
  const { error } = Logger(
    { ...config, debug: config.debug } as Config,
    `[ROUTES][${key}]`
  );
  const [provider] = new URL(req.url).pathname.split('/').reverse();
  try {
    const passThroughUrl = new URL(req.url);
    const params = new URLSearchParams(passThroughUrl.search);
    const url = `${proxyRoutes(config)[key]}/${provider}${
      params.toString() !== '' ? `?${params.toString()}` : ''
    }`;

    const res = await request(
      url,
      {
        request: req,
        method: req.method,
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
  } catch (e) {
    error(e);
  }
  return new Response('An unexpected error has occurred.', { status: 400 });
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes.CALLBACK);
}
