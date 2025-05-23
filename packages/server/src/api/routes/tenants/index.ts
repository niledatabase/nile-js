import { Config } from '../../../utils/Config';
import { Routes } from '../../types';
import auth from '../../utils/auth';
import Logger from '../../../utils/Logger';
import { urlMatches, DefaultNileAuthRoutes, isUUID } from '../../utils/routes';

import { GET } from './GET';
import { GET as TENANT_GET } from './[tenantId]/GET';
import { DELETE } from './[tenantId]/DELETE';
import { PUT } from './[tenantId]/PUT';
import { POST } from './POST';

const key = 'TENANTS';

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
  const [possibleTenantId] = request.url.split('/').reverse();

  switch (request.method) {
    case 'GET':
      if (isUUID(possibleTenantId)) {
        return await TENANT_GET(config, { request }, info);
      }
      return await GET(config, session, { request });
    case 'POST':
      return await POST(config, { request });
    case 'DELETE':
      return await DELETE(config, { request });
    case 'PUT':
      return await PUT(config, { request });

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchTenants(
  config: Config,
  method: 'POST' | 'GET',
  body?: string
): Promise<Response> {
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${DefaultNileAuthRoutes.TENANTS}`;

  const init: RequestInit = {
    method,
    headers: config.headers,
  };
  if (method === 'POST') {
    init.body = body;
  }
  const req = new Request(clientUrl, init);

  return (await config.handlers.POST(req)) as Response;
}

export async function fetchTenant(
  config: Config,
  method: 'GET' | 'DELETE' | 'PUT',
  body?: string
) {
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
  const clientUrl = `${config.serverOrigin}${
    config.routePrefix
  }${DefaultNileAuthRoutes.TENANT.replace('{tenantId}', config.tenantId)}`;
  const m = method ?? 'GET';
  const init: RequestInit = {
    method: m,
    headers: config.headers,
  };
  if (m === 'PUT') {
    init.body = body;
  }
  const req = new Request(clientUrl, init);

  return (await config.handlers[m](req)) as Response;
}

export async function fetchTenantsByUser(config: Config) {
  if (config.logger?.warn) {
    if (!config.userId) {
      config.logger?.warn(
        'nile.userId is not set. The call will still work for the API, but the database context is not set properly and may lead to unexpected behavior in your application.'
      );
    } else if (!isUUID(config.userId)) {
      config.logger?.warn(
        'nile.userId is not a valid UUID. This may lead to unexpected behavior in your application.'
      );
    }
  }
  const clientUrl = `${config.serverOrigin}${
    config.routePrefix
  }${DefaultNileAuthRoutes.USER_TENANTS.replace(
    '{userId}',
    config.userId ?? 'WARN_NOT_SET'
  )}`;
  const req = new Request(clientUrl, { headers: config.headers });

  return (await config.handlers.GET(req)) as Response;
}
