import { Config } from '../../../../../../utils/Config';
import { DefaultNileAuthRoutes, urlMatches } from '../../../../../utils/routes';
import { Routes } from '../../../../../types';
import auth from '../../../../../utils/auth';

import { DELETE } from './DELETE';
import { PUT } from './PUT';

const key = 'TENANT_USER';

export default async function route(request: Request, config: Config) {
  const { info } = config.logger(`[ROUTES][${key}]`);
  const session = await auth(request, config);

  if (!session) {
    info('401');
    return new Response(null, { status: 401 });
  }
  const yurl = new URL(request.url);
  const [, userId] = yurl.pathname.split('/').reverse();

  if (!userId) {
    info('No tenant id found in path');
    return new Response(null, { status: 404 });
  }

  switch (request.method) {
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
  const [, userId, possibleTenantId, tenantId] = url.pathname
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

export async function fetchTenantUser(
  config: Config,
  method: 'DELETE' | 'PUT'
) {
  if (!config.tenantId) {
    throw new Error(
      'The tenantId context is missing. Call nile.setContext({ tenantId })'
    );
  }

  if (!config.userId) {
    throw new Error(
      'the userId context is missing. Call nile.setContext({ userId })'
    );
  }

  const clientUrl = `${config.serverOrigin}${
    config.routePrefix
  }${DefaultNileAuthRoutes.TENANT_USER.replace(
    '{tenantId}',
    config.tenantId
  ).replace('{userId}', config.userId)}/link`;
  const req = new Request(clientUrl, {
    headers: config.headers,
    method,
  });

  return (await config.handlers[method](req)) as Response;
}
