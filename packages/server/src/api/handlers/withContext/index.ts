import { Server } from '../../../Server';
import {
  ContextReturn,
  CTXHandlerType,
  NileConfig,
  RouteReturn,
} from '../../../types';
import { Config } from '../../../utils/Config';
import getter from '../GET';
import poster from '../POST';
import deleter from '../DELETE';
import puter from '../PUT';

export function handlersWithContext(config: Config): CTXHandlerType {
  const GET = getter(config.routes, config);
  const POST = poster(config.routes, config);
  const DELETE = deleter(config.routes, config);
  const PUT = puter(config.routes, config);

  return {
    GET: async <T = Response>(req: Request): Promise<ContextReturn<T>> => {
      const response = await GET(req);
      const updatedConfig = updateConfig(response, config);
      return { response: response as T, nile: new Server(updatedConfig) };
    },
    POST: async <T = Response>(req: Request): Promise<ContextReturn<T>> => {
      const response = await POST(req);
      const updatedConfig = updateConfig(response, config);
      return { response: response as T, nile: new Server(updatedConfig) };
    },
    DELETE: async <T = Response>(req: Request): Promise<ContextReturn<T>> => {
      const response = await DELETE(req);
      const updatedConfig = updateConfig(response, config);
      return { response: response as T, nile: new Server(updatedConfig) };
    },
    PUT: async <T = Response>(req: Request): Promise<ContextReturn<T>> => {
      const response = await PUT(req);
      const updatedConfig = updateConfig(response, config);
      return { response: response as T, nile: new Server(updatedConfig) };
    },
  };
}

export function updateConfig(
  response: RouteReturn,
  config: Config
): NileConfig {
  let origin = 'http://localhost:3000';
  let headers: Headers | null = null;

  if (response instanceof Response) {
    if (response?.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        const urlLocation = new URL(location);
        origin = urlLocation.origin;
      }
    }

    const setCookies: string[] = [];

    // Headers are iterable
    if (response?.headers) {
      for (const [key, value] of response.headers) {
        if (key.toLowerCase() === 'set-cookie') {
          setCookies.push(value);
        }
      }
    }
    if (setCookies.length > 0) {
      const cookieHeader = setCookies
        .map((cookieStr) => cookieStr.split(';')[0])
        .join('; ');

      headers = new Headers({ cookie: cookieHeader });
    }
  }

  return {
    ...config,
    origin,
    headers: headers ?? undefined,
    useLastContext: true,
  };
}
