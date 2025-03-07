import { Config } from '../../../../../utils/Config';
import urlMatches from '../../../../utils/routes/urlMatches';
import { Routes } from '../../../../types';
import auth from '../../../../utils/auth';
import Logger from '../../../../../utils/Logger';

import { GET } from './GET';
import { POST } from './POST';
import { DELETE } from './[userId]/DELETE';
import { PUT } from './PUT';

const key = 'TENANT_USERS';

export default async function route(request: Request, config: Config) {
  const { info } = Logger(
    { ...config, debug: config.debug } as Config,
    `[ROUTES][${key}]`
  );
  const session = await auth(request, config);

  if (!session) {
    info('401');
    return new Response(null, { status: 401 });
  }
  const yurl = new URL(request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();

  if (!tenantId) {
    info('No tenant id found in path');
    return new Response(null, { status: 404 });
  }

  switch (request.method) {
    case 'GET':
      return await GET(config, { request });
    case 'POST':
      return await POST(config, session, { request });
    case 'PUT':
      return await PUT(config, { request });
    case 'DELETE':
      return await DELETE(config, { request });

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  const url = new URL(request.url);
  const [userId, possibleTenantId, tenantId] = url.pathname
    .split('/')
    .reverse();
  let route = configRoutes[key]
    .replace('{tenantId}', tenantId)
    .replace('{userId}', userId);
  if (userId === 'users') {
    route = configRoutes[key].replace('{tenantId}', possibleTenantId);
  }
  return urlMatches(request.url, route);
}
