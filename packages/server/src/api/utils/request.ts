// const { log } = console;

export default async function request(
  url: string,
  _init: RequestInit & { request: Request }
) {
  const { request, ...init } = _init;
  const requestUrl = new URL(request.url);
  const updatedHeaders = new Headers(request.headers);
  // updatedHeaders.delete('content-length');
  // updatedHeaders.delete('transfer-encoding');

  updatedHeaders.set('niledb-origin', requestUrl.origin);
  updatedHeaders.set(
    'niledb-creds',
    Buffer.from(
      `${process.env.NILEDB_USER}:${process.env.NILEDB_PASSWORD}`
    ).toString('base64')
  );
  const params = { ...init, headers: updatedHeaders };
  if (params.method === 'POST' || params.method === 'PUT') {
    updatedHeaders.set('content-type', 'text/plain;charset=UTF-8');
    params.body = init.body ?? request.body;
    // @ts-expect-error - its there
    params.duplex = 'half';
  }

  // log(`[${params.method ?? 'GET'}]`, url);
  const res = await fetch(url, { ...params }).catch(() => {
    // log('An error has occurred in the fetch', e);
  });
  // const loggingRes = typeof res?.clone === 'function' ? res?.clone() : null;
  // log('[Response]', res?.status, res?.statusText, await loggingRes?.text());
  return res;
}
