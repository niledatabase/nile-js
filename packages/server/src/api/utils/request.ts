import {
  X_NILE_ORIGIN,
  X_NILE_SECURECOOKIES,
  X_NILE_TENANT,
} from '../../utils/constants';
import { Config } from '../../utils/Config';
import Logger from '../../utils/Logger';

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
  if (request.headers.get(X_NILE_TENANT)) {
    updatedHeaders.set(
      X_NILE_TENANT,
      String(request.headers.get(X_NILE_TENANT))
    );
  }
  if (config.secureCookies != null) {
    updatedHeaders.set(X_NILE_SECURECOOKIES, String(config.secureCookies));
  }

  updatedHeaders.set('host', requestUrl.host);
  if (config.callbackUrl) {
    const cbUrl = new URL(config.callbackUrl);
    debug(`Obtained origin from config.callbackUrl ${config.callbackUrl}`);
    updatedHeaders.set(X_NILE_ORIGIN, cbUrl.origin);
    // } else if (config.api.origin) {
    // debug(`Obtained origin from config.api.origin ${config.api.origin}`);
    // updatedHeaders.set(X_NILE_ORIGIN, config.api.origin);
  } else {
    updatedHeaders.set(X_NILE_ORIGIN, requestUrl.origin);
    debug(`Obtained origin from request ${requestUrl.origin}`);
  }
  const params = { ...init };
  if (
    params.method?.toLowerCase() === 'post' ||
    params.method?.toLowerCase() === 'put'
  ) {
    try {
      updatedHeaders.set('content-type', 'application/json');
      const initBody = await new Response(_init.request.clone().body).json();
      const requestBody = await new Response(request.clone().body).json();
      params.body = JSON.stringify(initBody ?? requestBody);
    } catch (e) {
      updatedHeaders.set('content-type', 'application/x-www-form-urlencoded');
      const initBody = await new Response(_init.request.clone().body).text();
      const requestBody = await new Response(request.clone().body).text();
      params.body = initBody ?? requestBody;
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
