import { Server } from '../../../Server';
import { NileConfig } from '../../../types';
import { Config } from '../../../utils/Config';
import getter from '../GET';
import poster from '../POST';
import deleter from '../DELETE';
import puter from '../PUT';

export type CTXHandlerType = {
  GET: (req: Request) => Promise<{ response: void | Response; nile: Server }>;
  POST: (req: Request) => Promise<{ response: void | Response; nile: Server }>;
  DELETE: (
    req: Request
  ) => Promise<{ response: void | Response; nile: Server }>;
  PUT: (req: Request) => Promise<{ response: void | Response; nile: Server }>;
};
export function handlersWithContext(config: Config): CTXHandlerType {
  const GET = getter(config.routes, config);
  const POST = poster(config.routes, config);
  const DELETE = deleter(config.routes, config);
  const PUT = puter(config.routes, config);
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
): NileConfig {
  let origin = 'http://localhost:3000';
  let headers: Headers | null = null;

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

  return {
    ...config,
    origin,
    headers: headers ?? undefined,
  };
}
