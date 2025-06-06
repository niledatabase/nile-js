import { Config } from '../../../../../utils/Config';
import {
  DefaultNileAuthRoutes,
  isUUID,
  urlMatches,
} from '../../../../utils/routes';
import { Routes } from '../../../../types';
import Logger from '../../../../../utils/Logger';

import { GET } from './GET';
import { POST } from './POST';

const key = 'TENANT_USERS';

export default async function route(request: Request, config: Config) {
  const { info } = Logger(
    { ...config, debug: config.debug } as Config,
    `[ROUTES][${key}]`
  );

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
      return await POST(config, { request });

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

export async function fetchTenantUsers(
  config: Config,
  method: 'GET' | 'POST',
  payload?: {
    body?: string;
    params?: { newTenantName?: string; tenantId?: string };
  }
) {
  const { body, params } = payload ?? {};
  if (!config.tenantId) {
    throw new Error(
      'Unable to fetch tenant, the tenantId context is missing. Call nile.setContext({ tenantId }), set nile.tenantId = "tenantId", or add it to the function call'
    );
  }
  if (!isUUID(config.tenantId) && config.logger?.warn) {
    config.logger?.warn(
      'nile.tenantId is not a valid UUID. This may lead to unexpected behavior in your application.'
    );
  }
  const q = new URLSearchParams();
  if (params?.newTenantName) {
    q.set('newTenantName', params.newTenantName);
  }
  if (params?.tenantId) {
    q.set('tenantId', params.tenantId);
  }
  const clientUrl = `${config.serverOrigin}${
    config.routePrefix
  }${DefaultNileAuthRoutes.TENANT_USERS.replace(
    '{tenantId}',
    config.tenantId
  )}`;
  const m = method ?? 'GET';
  const init: RequestInit = {
    method: m,
    headers: config.headers,
  };
  // I don't think post works
  if (method === 'POST') {
    init.body = body;
  }
  const req = new Request(clientUrl, init);

  return (await config.handlers[m](req)) as Response;
}
