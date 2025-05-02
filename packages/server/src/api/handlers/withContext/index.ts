import { Server } from '../../../Server';
import { ServerConfig } from '../../../types';
import { Config } from '../../../utils/Config';
import { Routes } from '../../types';
import getter from '../GET';
import poster from '../POST';
import deleter from '../DELETE';
import puter from '../PUT';

export function handlersWithContext(
  configRoutes: Routes,
  config: Config
): {
  GET: (req: Request) => Promise<{ response: void | Response; nile: Server }>;
  POST: (req: Request) => Promise<{ response: void | Response; nile: Server }>;
  DELETE: (
    req: Request
  ) => Promise<{ response: void | Response; nile: Server }>;
  PUT: (req: Request) => Promise<{ response: void | Response; nile: Server }>;
} {
  const GET = getter(configRoutes, config);
  const POST = poster(configRoutes, config);
  const DELETE = deleter(configRoutes, config);
  const PUT = puter(configRoutes, config);
  return {
    GET: async (req) => {
      const response = await GET(req);
      const updatedConfig = updateConfig(response, config);
      return { response, nile: new Server(updatedConfig) };
    },
    POST: async (req) => {
      const response = await POST(req);
      const updatedConfig = updateConfig(response, config);
      return { response, nile: new Server(updatedConfig) };
    },
    DELETE: async (req) => {
      const response = await DELETE(req);
      const updatedConfig = updateConfig(response, config);
      return { response, nile: new Server(updatedConfig) };
    },
    PUT: async (req) => {
      const response = await PUT(req);
      const updatedConfig = updateConfig(response, config);
      return { response, nile: new Server(updatedConfig) };
    },
  };
}

export function updateConfig(
  response: Response | void,
  config: Config
): ServerConfig {
  let origin = 'http://localhost:3000';
  let headers: Headers | null = null;

  if (response?.status === 302) {
    const location = response.headers.get('location');
    if (location) {
      origin = location;
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

  return {
    ...config,
    origin,
    headers: headers ?? undefined,
  };
}
