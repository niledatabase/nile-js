import {
  HEADER_ORIGIN,
  HEADER_SECURE_COOKIES,
  TENANT_COOKIE,
} from '../../utils/constants';
import { Config } from '../../utils/Config';
import Logger from '../../utils/Logger';

import { DEFAULT_PREFIX } from './routes';

export default async function request(
  url: string,
  _init: RequestInit & { request: Request },
  config: Config
) {
  const { debug, info, error } = Logger(config, '[REQUEST]');
  const { request, ...init } = _init;
  const requestUrl = new URL(request.url);
  const updatedHeaders = new Headers({});
  if (request.headers.get('cookie')) {
    updatedHeaders.set('cookie', String(request.headers.get('cookie')));
  }
  if (request.headers.get(TENANT_COOKIE)) {
    updatedHeaders.set(
      TENANT_COOKIE,
      String(request.headers.get(TENANT_COOKIE))
    );
  }
  // sets secure cookies for production
  if (config.secureCookies != null) {
    updatedHeaders.set(HEADER_SECURE_COOKIES, String(config.secureCookies));
  } else {
    updatedHeaders.set(
      HEADER_SECURE_COOKIES,
      process.env.NODE_ENV === 'production' ? 'true' : 'false'
    );
  }

  updatedHeaders.set('host', requestUrl.host);
  if (config.callbackUrl) {
    const cbUrl = new URL(config.callbackUrl);
    debug(`Obtained origin from config.callbackUrl ${config.callbackUrl}`);
    updatedHeaders.set(HEADER_ORIGIN, cbUrl.origin);
    // this origin may be overridden, but when SDK requests are made, we want to ignore it
  } else if (config.origin) {
    debug(`Obtained origin from config.origin ${config.origin}`);
    updatedHeaders.set(HEADER_ORIGIN, config.origin);
  } else {
    const passedOrigin = request.headers.get(HEADER_ORIGIN);
    if (passedOrigin) {
      updatedHeaders.set(HEADER_ORIGIN, passedOrigin);
    } else {
      const reqOrigin =
        config.routePrefix !== DEFAULT_PREFIX
          ? `${requestUrl.origin}${config.routePrefix}`
          : requestUrl.origin;

      updatedHeaders.set(HEADER_ORIGIN, reqOrigin);
      debug(`Obtained origin from request ${reqOrigin}`);
    }
  }
  const params = { ...init };

  if (
    params.method?.toLowerCase() === 'post' ||
    params.method?.toLowerCase() === 'put'
  ) {
    try {
      updatedHeaders.set('content-type', 'application/json');

      const bodyStream = _init.body ?? _init.request?.body ?? request.body;

      const bodyText = await new Response(bodyStream).text();

      // try to parse JSON, fallback to text if not
      try {
        params.body = JSON.stringify(JSON.parse(bodyText));
      } catch {
        updatedHeaders.set('content-type', 'application/x-www-form-urlencoded');
        params.body = bodyText;
      }
    } catch (e) {
      error('Failed to parse request body');
    }
  }
  params.headers = updatedHeaders;
  const fullUrl = `${url}${requestUrl.search}`;

  if (config.debug) {
    // something going on with `fetch` in nextjs, possibly other places
    // hot-reloading does not always give back `set-cookie` from fetchCSRF
    // cURL seems to always do it (and in a real app, you don't have hot reloading),
    // so add a cache bypass to stop the annoying failure reloads that actually work
    params.headers.set('request-id', crypto.randomUUID());
    params.cache = 'no-store';
  }

  await config.extensionCtx?.handleOnRequest(config, _init, params);

  try {
    const res: Response | void = await fetch(fullUrl, {
      ...params,
    }).catch((e) => {
      error('An error has occurred in the fetch', {
        message: e.message,
        stack: e.stack,
      });
      return new Response(
        'An unexpected (most likely configuration) problem has occurred',
        { status: 500 }
      );
    });
    const loggingRes = typeof res?.clone === 'function' ? res?.clone() : null;
    info(`[${params.method ?? 'GET'}] ${fullUrl}`, {
      status: res?.status,
      statusText: res?.statusText,
      text: await loggingRes?.text(),
    });
    return res;
  } catch (e) {
    if (e instanceof Error) {
      error('An error has occurred in the fetch', {
        message: e.message,
        stack: e.stack,
      });
    }
    return new Response(
      'An unexpected (most likely configuration) problem has occurred',
      { status: 500 }
    );
  }
}
