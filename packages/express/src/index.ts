import { AsyncLocalStorage } from 'async_hooks';
import { IncomingHttpHeaders } from 'http';

import { PartialContext, ExtensionState, Server } from '@niledatabase/server';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
  Express,
} from 'express';

export function cleaner(val: string) {
  return val.replaceAll(/\{([^}]+)\}/g, ':$1');
}

type ExpressRouteHandler = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) => void | Promise<void>;

type ExpressRouteFunctions = {
  GET: ExpressRouteHandler;
  POST: ExpressRouteHandler;
  PUT: ExpressRouteHandler;
  DELETE: ExpressRouteHandler;
};

type NileWithExpress = Server & {
  handlers: ExpressRouteFunctions;
};

// AsyncLocalStorage to persist context per request
const contextStore = new AsyncLocalStorage<Map<string, unknown>>();

// Express extension factory
export const express = (app?: Express) => {
  let init = false;

  return (instance: Server) => {
    const { error, debug } = instance.logger('[EXTENSION][express]');

    // Internal context helpers - I think we delete this now?
    const setRequestContext = (context: PartialContext) => {
      contextStore.getStore()?.set('context', context);

      instance.withContext(context);
    };

    function doConfigure(server: NileWithExpress) {
      if (app) {
        debug('routes configured');
        app.get(server.paths.get, server.handlers.GET);
        app.post(server.paths.post, server.handlers.POST);
        app.put(server.paths.put, server.handlers.PUT);
        app.delete(server.paths.delete, server.handlers.DELETE);
      }
    }

    if (!init && app) {
      debug('initializing express extension with middleware');

      app.use((req, res, next) => {
        contextStore.run(new Map(), () => next());
      });

      app.param('tenantId', (req, res, next, tenantId) => {
        debug(`tenantId param set: ${tenantId}`);
        setRequestContext({
          tenantId,
          headers: new Headers(normalizeHeaders(req.headers)),
        });
        next();
      });

      app.use((req, res, next) => {
        setRequestContext({
          headers: new Headers(normalizeHeaders(req.headers)),
        });
        next();
      });
    }

    init = true;

    return {
      id: 'express',

      onConfigure: () => {
        const { paths: rawPaths } = instance;
        const paths = {
          get: rawPaths.get.map(cleaner),
          post: rawPaths.post.map(cleaner),
          put: rawPaths.put.map(cleaner),
          delete: rawPaths.delete.map(cleaner),
        };
        debug(`paths configured ${JSON.stringify(paths)}`);
        instance.paths = paths;
        doConfigure(instance as NileWithExpress);
      },

      onHandleRequest: async (
        params: [ExpressRequest, ExpressResponse, NextFunction]
      ) => {
        const [req, res, next] = params;
        debug('handling response');

        const reqUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

        try {
          new URL(reqUrl);
        } catch {
          throw new Error('Invalid URL — are you running Express?');
        }

        const method = req.method;
        const init: RequestInit = { method, headers: new Headers() };

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
        if (!res.headersSent) {
          debug('sending response');
          res.status(response.status).set(newHeaders);
          typeof body === 'string' ? res.send(body) : res.json(body ?? {});
        }

        return ExtensionState.onHandleRequest;
      },
    };
  };
};

function normalizeHeaders(headers: IncomingHttpHeaders): HeadersInit {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.join(','); // Join multi-values with commas
    }
  }
  return normalized;
}
