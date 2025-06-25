import { ExtensionState, Server } from '@niledatabase/server';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';

export function cleaner(val: string) {
  return val.replaceAll(/\{([^}]+)\}/g, ':$1');
}

export const express = (instance: Server) => {
  const { error, debug } = instance.logger('[EXTENSION][express]');
  return {
    id: 'express',
    onSetContext: (
      req: ExpressRequest,
      res: ExpressResponse,
      next: NextFunction
    ) => {
      // do this first, since `cookies` does not persist across context set
      if (req.params.tenantId) {
        instance.setContext({ tenantId: req.params.tenantId });
      }

      if (req.headers) {
        instance.setContext(req.headers);
      }
      if (req instanceof Headers) {
        instance.setContext(req);
      }

      if (typeof next === 'function') {
        next();
      }
    },
    onConfigure: () => {
      const { paths: nilePaths } = instance;
      const paths = {
        get: nilePaths.get.map(cleaner),
        post: nilePaths.post.map(cleaner),
        put: nilePaths.put.map(cleaner),
        delete: nilePaths.delete.map(cleaner),
      };
      debug(`paths configured ${JSON.stringify(paths)}`);
      instance.paths = paths;
    },
    onHandleRequest: async (req: ExpressRequest, res: ExpressResponse) => {
      // handle standard request objects
      if (req instanceof Request) {
        debug('using default response');
        const response = await instance.handlers[
          req.method as 'GET' | 'POST' | 'PUT' | 'DELETE'
          // disable the extension so we don't re-handle
        ](req, { disableExtensions: ['express'] });
        return response;
      }

      debug('handling response');
      instance.setContext(req.headers);

      const reqUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

      // be sure its a valid url
      try {
        new URL(reqUrl);
      } catch (e) {
        throw new Error(
          'Invalid URL sent for handle request. Are you running express?'
        );
      }
      const { method } = req;
      const init: RequestInit = { method, headers: new Headers() };
      // seems like this should work without this, since `get/set context should do the things we think it should.
      if (
        'headers' in req &&
        typeof req.headers === 'object' &&
        req.headers &&
        'cookie' in req.headers &&
        typeof req.headers.cookie === 'string'
      ) {
        (init.headers as Headers).set('cookie', req.headers.cookie);
      }

      if ('body' in req) {
        if (method === 'POST' || method === 'PUT') {
          init.body = JSON.stringify(req.body);
        }
      }

      const proxyRequest = new Request(reqUrl, init);
      debug(
        `[${method.toUpperCase()}]proxy request converted to ${reqUrl} with ${JSON.stringify(
          init
        )}`
      );

      let response: Response = null as unknown as Response;

      try {
        response = (await instance.handlers[
          req.method as 'GET' | 'POST' | 'PUT' | 'DELETE'
        ](proxyRequest, { disableExtensions: ['express'] })) as Response;
      } catch (e) {
        error(e);
      }

      let body;
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

      if (!res.headersSent) {
        debug('sending response');
        res.status(response.status).set(newHeaders);
        if (typeof body === 'string') {
          res.send(body);
        } else {
          res.json(body ?? {});
        }
      }
      // always return to prevent infinite loop
      return ExtensionState.onHandleRequest;
    },
  };
};
