import {
  App,
  createRouter,
  eventHandler,
  getHeaders,
  getRequestURL,
  readRawBody,
  appendHeader,
  H3Event,
} from 'h3';
import { Server, Extension } from '@niledatabase/server';

declare module 'h3' {
  interface H3EventContext {
    nile: Server;
  }
}

export function cleaner(val: string) {
  return val.replaceAll(/\{([^}]+)\}/g, ':$1');
}

const convertHeader = ([key, value]: [
  string,
  string | string[] | undefined
]) => [
  key.toLowerCase(),
  Array.isArray(value) ? value.join(', ') : String(value),
];

/**
 * H3 extension for Nile.
 * This ensures all handlers run within Nile's request context.
 */
export const h3 =
  (app?: App): Extension =>
  () => ({
    id: 'h3',
    onConfigure: (nile: Server) => {
      if (app) {
        // 1. Register global middleware to set context for every request
        app.use(
          eventHandler((event: H3Event) => {
            // Attach nile to the event context
            event.context.nile = nile;
            // Use enterWith to transition the async context for the remainder of the request
            nile.enterContext({
              headers: new Headers(getHeaders(event) as HeadersInit),
            });
          })
        );

        // 2. Register Nile Routes
        const router = createRouter();
        const { paths: rawPaths } = nile;

        const paths = {
          GET: rawPaths.get.map(cleaner),
          POST: rawPaths.post.map(cleaner),
          PUT: rawPaths.put.map(cleaner),
          DELETE: rawPaths.delete.map(cleaner),
        };

        const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;

        methods.forEach((method) => {
          paths[method].forEach((path) => {
            /* eslint-disable no-console */
            // console.log(`Registering route: [${method}] ${path}`);

            const handler = eventHandler(async (event) => {
              // console.log(`Matched route: [${method}] ${path}`);
              // Adapt H3Event to Web Request (borrowed from Nitro extension logic)
              const url = getRequestURL(event);
              const reqHeaders = event.node.req.headers;
              const headers: HeadersInit = reqHeaders
                ? Object.fromEntries(
                    Object.entries(reqHeaders).map(convertHeader)
                  )
                : {};

              const body = ['POST', 'PUT', 'PATCH'].includes(method)
                ? await readRawBody(event)
                : null;

              const requestInit: RequestInit = {
                method,
                headers,
                body: body || null,
              };

              const request = new Request(url, requestInit);

              // Call standard Nile handler
              // Context is already set by global middleware above
              const response = await nile.handlers[method](request as any);

              if (response instanceof Response) {
                response.headers.forEach((value, key) => {
                  if (key.toLowerCase() !== 'set-cookie') {
                    event.node.res.setHeader(key, value);
                  }
                });

                const setCookie = response.headers.getSetCookie?.();
                if (setCookie && Array.isArray(setCookie)) {
                  setCookie.forEach((c) =>
                    appendHeader(event, 'Set-Cookie', c)
                  );
                } else {
                  const cookie = response.headers.get('set-cookie');
                  if (cookie) {
                    appendHeader(event, 'Set-Cookie', cookie);
                  }
                }

                event.node.res.statusCode = response.status;
                // Nile handlers return JSON or Text
                const responseBody = await response
                  .json()
                  .catch(() => response.text());
                return responseBody;
              }
              return response;
            });

            if (method === 'GET') {
              router.get(path, handler);
            } else if (method === 'POST') {
              router.post(path, handler);
            } else if (method === 'PUT') {
              router.put(path, handler);
            } else if (method === 'DELETE') {
              router.delete(path, handler);
            }
          });
        });

        app.use(router.handler);
      }
    },
  });
