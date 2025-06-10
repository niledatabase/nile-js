import { Routes } from '../../types';
import {
  DefaultNileAuthRoutes,
  isUUID,
  prefixAppRoute,
  urlMatches,
} from '../../utils/routes';
import { Config } from '../../../utils/Config';

import { POST } from './POST';
import { GET } from './GET';
import { PUT } from './[userId]/PUT';

const key = 'USERS';

export default async function route(request: Request, config: Config) {
  const { info } = config.logger(`[ROUTES][${key}]`);

  switch (request.method) {
    case 'GET':
      return await GET(config, { request }, info);
    case 'POST':
      return await POST(config, { request });
    case 'PUT':
      return await PUT(config, { request });

    default:
      return new Response('method not allowed', { status: 405 });
  }
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchUser(config: Config, method: 'PUT') {
  let clientUrl = `${prefixAppRoute(config)}${DefaultNileAuthRoutes.USERS}`;

  if (method === 'PUT')
    if (!config.userId) {
      throw new Error(
        'Unable to update user, the userId context is missing. Call nile.setContext({ userId }), set nile.userId = "userId", or add it to the function call'
      );
    } else {
      clientUrl = `${prefixAppRoute(
        config
      )}${DefaultNileAuthRoutes.USER.replace('{userId}', config.userId)}`;
    }
  if (!isUUID(config.userId)) {
    config
      .logger('[fetchUser]')
      .warn(
        'nile.userId is not a valid UUID. This may lead to unexpected behavior in your application.'
      );
  }

  const init: RequestInit = {
    method,
    headers: config.headers,
  };
  const req = new Request(clientUrl, init);

  return (await config.handlers[method](req)) as Response;
}
