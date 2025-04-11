import { setContext, setCookie } from '../../context/asyncStorage';
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
  if (config.api.secureCookies != null) {
    updatedHeaders.set(X_NILE_SECURECOOKIES, String(config.api.secureCookies));
  }

  updatedHeaders.set('host', requestUrl.host);
  if (config.api.callbackUrl) {
    const cbUrl = new URL(config.api.callbackUrl);
    debug(
      `Obtained origin from config.api.callbackUrl ${config.api.callbackUrl}`
    );
    updatedHeaders.set(X_NILE_ORIGIN, cbUrl.origin);
  } else if (config.api.origin) {
    debug(`Obtained origin from config.api.origin ${config.api.origin}`);
    updatedHeaders.set(X_NILE_ORIGIN, config.api.origin);
  } else {
    updatedHeaders.set(X_NILE_ORIGIN, requestUrl.origin);
    debug(`Obtained origin from request ${requestUrl.origin}`);
  }
  const params = { ...init, headers: updatedHeaders };
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

  const fullUrl = `${url}${requestUrl.search}`;
  try {
    setContext(updatedHeaders);
    // set the headers so they can be used on subsequent server side requests
    const res: Response | void = await fetch(fullUrl, { ...params }).catch(
      (e) => {
        error('An error has occurred in the fetch', {
          message: e.message,
          stack: e.stack,
        });
        return new Response(
          'An unexpected (most likely configuration) problem has occurred',
          { status: 500 }
        );
      }
    );
    const loggingRes = typeof res?.clone === 'function' ? res?.clone() : null;
    info(`[${params.method ?? 'GET'}] ${fullUrl}`, {
      status: res?.status,
      statusText: res?.statusText,
      text: await loggingRes?.text(),
    });
    // a special handler for a `set-cookie` header
    setCookie(res?.headers);
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
