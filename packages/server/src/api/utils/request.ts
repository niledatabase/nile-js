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
  const { info, error } = Logger(config, '[REQUEST]');
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
  if ('secureCookies' in config && config.secureCookies != null) {
    updatedHeaders.set(X_NILE_SECURECOOKIES, String(config.secureCookies));
  }

  updatedHeaders.set('host', requestUrl.host);
  updatedHeaders.set(X_NILE_ORIGIN, requestUrl.origin);
  const params = { ...init, headers: updatedHeaders };
  if (params.method === 'POST' || params.method === 'PUT') {
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
    const res = await fetch(fullUrl, { ...params }).catch((e) => {
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
