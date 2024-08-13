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
    { ...config, debug: config.debug },
    '[ROUTES]',
    `[${key}]`
  );
  const session = await auth(request, config);

  if (!session) {
    info('401');
    return new Response(null, { status: 401 });
  }

  switch (request.method) {
    case 'GET':
      return await GET(session, { request }, info);
    case 'POST':
      return await POST(session, { request }, info);
    case 'PUT':
      return await PUT(session, { request }, info);
    case 'DELETE':
      return await DELETE(session, { request }, info);

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