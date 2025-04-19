import { Server } from '../Server';
import Logger from '../utils/Logger';

export function cleaner(val: string) {
  return val.replaceAll(/\{([^}]+)\}/g, ':$1');
}

export function expressPaths(nile: Server) {
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

type HandlerConfig = { muteResponse?: boolean; init?: RequestInit };
export async function NileExpressHandler(nile: Server, config?: HandlerConfig) {
  const { error } = Logger(nile.config, 'nile-express');
  async function handler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res?: any
  ): Promise<
    | {
        body: string;
        status: number;
        headers: Record<string, string | string[]>;
        response: Response;
      }
    | null
    | undefined
  > {
    const headers = new Headers(req.headers);
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
    const _init: RequestInit = { method, ...config?.init };

    if ('body' in req) {
      if (method === 'POST' || method === 'PUT') {
        headers.set('content-type', 'application/json');
        _init.body = JSON.stringify(req.body);
      }
    }
    headers.delete('connection');

    _init.headers = headers;

    const reqUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    // be sure its a valid url
    try {
      new URL(reqUrl);
    } catch (e) {
      error('Invalid URL', {
        url: reqUrl,
        error: e,
      });
      return null;
    }
    const proxyRequest = new Request(reqUrl, { headers: req.headers });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response = await (nile.api.handlers as any)[method](proxyRequest);
    } catch (e) {
      error(e);
    }

    let body;

    if (response instanceof Response) {
      try {
        const tryJson = await response.clone();
        body = await tryJson.json();
      } catch (e) {
        body = await response.text();
      }
      const newHeaders: Record<string, string | string[]> = {};
      response.headers.forEach((value, key) => {
        if (
          !['content-length', 'transfer-encoding'].includes(key.toLowerCase())
        ) {
          if (newHeaders[key]) {
            const prev = newHeaders[key];
            if (Array.isArray(prev)) {
              newHeaders[key] = [...prev, value];
            } else {
              newHeaders[key] = [prev, value];
            }
          } else {
            newHeaders[key] = value;
          }
        }
      });

      if (config?.muteResponse !== true) {
        if (res) {
          res.status(response.status).set(newHeaders);
          if (typeof body === 'string') {
            res.send(body);
          } else {
            res.json(body ?? {});
          }
        }
        return;
      }

      return {
        body,
        status: response.status,
        headers: newHeaders,
        response,
      };
    } else {
      error('Bad response', { response });
      return;
    }
  }
  const { paths } = expressPaths(nile);
  return { handler, paths };
}
