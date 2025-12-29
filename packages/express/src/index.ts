import { AsyncLocalStorage } from 'async_hooks';
import { IncomingHttpHeaders } from 'http';

import {
  ExtensionState,
  Server,
  Extension,
  PartialContext,
} from '@niledatabase/server';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
  Express,
} from 'express';

export function cleaner(val: string) {
  return val.replaceAll(/\{([^}]+)\}/g, ':$1');
}

const contextStore = new AsyncLocalStorage<Map<string, unknown>>();

const express = (
  app: Express
): Extension<[ExpressRequest, ExpressResponse, NextFunction]> => {
  let instance: Server;

  return () => ({
    id: 'express',

    onConfigure: (server: Server) => {
      instance = server;
      const { debug } = instance.logger('[EXTENSION][express]');
      const { paths: rawPaths } = instance;
      const paths = {
        get: rawPaths.get.map(cleaner),
        post: rawPaths.post.map(cleaner),
        put: rawPaths.put.map(cleaner),
        delete: rawPaths.delete.map(cleaner),
      };
      debug(`paths configured ${JSON.stringify(paths)}`);
      instance.paths = paths;

      if (app) {
        debug('initializing express extension with middleware');

        app.use(
          (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
            contextStore.run(new Map(), () => next());
          }
        );

        const setRequestContext = (context: PartialContext) => {
          contextStore.getStore()?.set('context', context);
          instance.withContext(context);
        };

        app.param(
          'tenantId',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (req: any, res: any, next: any, tenantId: string) => {
            debug(`tenantId param set: ${tenantId}`);
            setRequestContext({
              tenantId,
              headers: new Headers(normalizeHeaders(req.headers)),
            });
            next();
          }
        );

        app.use(
          (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
            setRequestContext({
              headers: new Headers(normalizeHeaders(req.headers)),
            });
            next();
          }
        );

        debug('routes configured');
        // We cast handlers to any because Server handlers are Fetch-based but we mount them on Express
        // The Express extension assumes the Server handlers can handle the request or that
        // they are replaced/wrapped. In the original implementation, this was just passed through.
        // However, standard Nile handlers expect (req: Request). Express passes (req, res, next).
        // If this works, it's because Nile handlers might be handling the args or ignoring extra args?
        // Actually, the original code had 'server.handlers.GET' passed to 'app.get'.
        // We will do the same.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlers = instance.handlers as any;
        app.get(paths.get, handlers.GET);
        app.post(paths.post, handlers.POST);
        app.put(paths.put, handlers.PUT);
        app.delete(paths.delete, handlers.DELETE);
      }
    },

    onHandleRequest: async (
      params?: [ExpressRequest, ExpressResponse, NextFunction]
    ) => {
      if (!instance) {
        return;
      }
      const { error, debug } = instance.logger('[EXTENSION][express]');

      if (!params) {
        return;
      }
      const [req, res, next] = params;
      debug('handling response');

      let reqUrl = '';
      const method = req.method;
      const init: RequestInit = { method, headers: new Headers() };
      if (req instanceof Request) {
        reqUrl = req.url;
        init.headers = req.headers;
      } else {
        try {
          reqUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        } catch {
          // handled later
        }
      }

      try {
        new URL(reqUrl);
      } catch {
        throw new Error('Invalid URL — are you running Express?');
      }

      if (req.headers?.cookie) {
        (init.headers as Headers).set('cookie', req.headers.cookie);
      }

      if (['POST', 'PUT'].includes(method) && req.body) {
        init.body = JSON.stringify(req.body);
      }

      const proxyRequest = new Request(reqUrl, init);
      debug(`[${method}] proxy: ${reqUrl} ${JSON.stringify(init)}`);

      let response: Response;
      const context = {
        headers: new Headers(req.headers as HeadersInit),
        tenantId: req.params?.tenantId || undefined,
      };
      try {
        response = await instance.withContext(context, async (ctx) => {
          return (await ctx.handlers[
            method as 'GET' | 'POST' | 'PUT' | 'DELETE'
          ](proxyRequest, { disableExtensions: ['express'] })) as Response;
        });
      } catch (e) {
        error(e);
        return next();
      }

      let body;
      try {
        body = await response.clone().json();
      } catch {
        body = await response.text();
      }

      const newHeaders: Record<string, string | string[]> = {};
      response.headers.forEach((value, key) => {
        if (
          !['content-length', 'transfer-encoding'].includes(key.toLowerCase())
        ) {
          if (newHeaders[key]) {
            const prev = newHeaders[key];
            newHeaders[key] = Array.isArray(prev)
              ? [...prev, value]
              : [prev, value];
          } else {
            newHeaders[key] = value;
          }
        }
      });

      if (!res) {
        return response;
      }

      if (!res.headersSent) {
        debug('sending response');
        res.status(response.status).set(newHeaders);
        typeof body === 'string' ? res.send(body) : res.json(body ?? {});
      }

      return ExtensionState.onHandleRequest;
    },
  });
};
export { express };

function normalizeHeaders(headers: IncomingHttpHeaders): HeadersInit {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.join(',');
    }
  }
  return normalized;
}
