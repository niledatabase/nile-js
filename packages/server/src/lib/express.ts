import { Server } from '../Server';
import Logger from '../utils/Logger';

export function cleaner(val: string) {
  return val.replaceAll(/\{(.*)\}/g, ':$1');
}

function expressPaths(nile: Server) {
  const paths = {
    get: nile.api.paths.get.map(cleaner),
    post: nile.api.paths.post.map(cleaner),
    put: nile.api.paths.put.map(cleaner),
    delete: nile.api.paths.delete.map(cleaner),
  };
  return {
    paths,
  };
}

export async function NileExpressHandler(nile: Server) {
  const { error } = Logger(nile.config, 'nile-express');
  async function handler(
    req: unknown,
    init?: RequestInit
  ): Promise<{
    body: string;
    status: number;
    headers: Record<string, string>;
    response: Response;
  } | null> {
    const headers = new Headers();
    if (!req || typeof req !== 'object') {
      return null;
    }
    if (!('url' in req) || typeof req?.url !== 'string') {
      error('A url is necessary for the nile express handler');
      return null;
    }
    const method =
      'method' in req && typeof req.method === 'string' ? req.method : 'GET';
    if (
      'headers' in req &&
      typeof req.headers === 'object' &&
      req.headers &&
      'cookie' in req.headers &&
      typeof req.headers.cookie === 'string'
    ) {
      headers.set('cookie', req.headers.cookie);
    }
    const _init: RequestInit = { method, ...init };

    if ('body' in req) {
      if (method === 'POST' || method === 'PUT') {
        headers.set('content-type', 'application/json');
        _init.body = JSON.stringify(req.body);
      }
    }

    _init.headers = headers;

    const proxyRequest = new Request(req.url, _init);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (nile.api.handlers as any)[method](
      proxyRequest
    )) as Response;

    let body;

    try {
      const tryJson = await response.clone();
      body = await tryJson.json();
    } catch (e) {
      body = await response.text();
    }
    const newHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (
        !['content-length', 'transfer-encoding'].includes(key.toLowerCase())
      ) {
        newHeaders[key] = value;
      }
    });
    return {
      body,
      status: response.status,
      headers: newHeaders,
      response,
    };
  }
  const { paths } = expressPaths(nile);
  return { handler, paths };
}
