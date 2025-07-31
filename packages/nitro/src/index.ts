import {
  appendHeader,
  EventHandlerRequest,
  getRequestURL,
  H3Event,
  readRawBody,
} from 'h3';
import { Server } from '@niledatabase/server';
import type { Extension } from '@niledatabase/server';

export type withNitro = Omit<Server, 'handlers'> & {
  handlers: (event: H3Event) => Response;
};

const convertHeader = ([key, value]: [
  string,
  string | string[] | undefined
]) => [
  key.toLowerCase(),
  Array.isArray(value) ? value.join(', ') : String(value),
];

export const nitro: Extension = () => ({
  id: 'nitro',
  replace: {
    handlers: (baseHandlers) => {
      return async (event: H3Event<EventHandlerRequest>) => {
        try {
          const url = getRequestURL(event);

          const reqHeaders = event.node.req.headers;
          const headers: HeadersInit = reqHeaders
            ? Object.fromEntries(Object.entries(reqHeaders).map(convertHeader))
            : {};

          const method = event.node.req.method || 'GET';
          const body = ['POST', 'PUT', 'PATCH'].includes(method)
            ? await readRawBody(event)
            : null;

          const requestInit: RequestInit = {
            method,
            headers,
          };
          if (body) {
            requestInit.body = body;
          }
          const request = new Request(url, requestInit);

          const res = await baseHandlers[
            request.method as 'GET' | 'POST' | 'PUT' | 'DELETE'
          ](request);

          if (res instanceof Response) {
            res.headers.forEach((value, key) => {
              if (key.toLowerCase() !== 'set-cookie') {
                event.node.res.setHeader(key, value);
              }
            });

            const setCookie = res.headers.getSetCookie?.();
            if (setCookie && Array.isArray(setCookie)) {
              for (const cookie of setCookie) {
                appendHeader(event, 'Set-Cookie', cookie);
              }
            } else {
              const cookie = res.headers.get('set-cookie');
              if (cookie) {
                appendHeader(event, 'Set-Cookie', cookie);
              }
            }

            event.node.res.statusCode = res.status;

            const responseBody = await res.json();
            return responseBody;
          }
        } catch (e) {
          return {
            message: e instanceof Error ? e.message : 'The request failed',
          };
        }
      };
    },
  },
});
