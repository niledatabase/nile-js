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
  const updatedHeaders = new Headers(request.headers);

  updatedHeaders.set('host', requestUrl.host);
  updatedHeaders.set('niledb-origin', requestUrl.origin);
  const params = { ...init, headers: updatedHeaders };
  if (params.method === 'POST' || params.method === 'PUT') {
    params.body = init.body ?? request.body;
    // @ts-expect-error - its there
    params.duplex = 'half';
  }

  try {
    const res = await fetch(url, { ...params }).catch((e) => {
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
    info(`[${params.method ?? 'GET'}] ${url}`, {
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
