import { Config } from '../../../../../utils/Config';
import {
  DefaultNileAuthRoutes,
  isUUID,
  urlMatches,
} from '../../../../utils/routes';
import { Routes } from '../../../../types';

import { PUT } from './PUT';
import { POST } from './POST';

const key = 'INVITE';

export default async function route(request: Request, config: Config) {
  switch (request.method) {
    // the browser is a GET, but we need to PUT it into nile-auth
    // server side, this is a put
    case 'GET':
    case 'PUT':
      return await PUT(config, { request });
    case 'POST':
      return await POST(config, { request });

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  const url = new URL(request.url);
  const [, tenantId] = url.pathname.split('/').reverse();
  const route = configRoutes[key].replace('{tenantId}', tenantId);
  return urlMatches(request.url, route);
}

export async function fetchInvite(
  config: Config,
  method?: 'POST' | 'PUT' | 'DELETE',
  body?: string
) {
  if (!config.tenantId) {
    throw new Error(
      'Unable to fetch tenant, the tenantId context is missing. Call nile.setContext({ tenantId }), set nile.tenantId = "tenantId", or add it to the function call'
    );
  }
  if (!isUUID(config.tenantId)) {
    config
      .logger('fetchInvite')
      .warn(
        'nile.tenantId is not a valid UUID. This may lead to unexpected behavior in your application.'
      );
  }
  let clientUrl = `${config.serverOrigin}${
    config.routePrefix
  }${DefaultNileAuthRoutes.INVITE.replace('{tenantId}', config.tenantId)}`;
  const m = method ?? 'GET';
  const init: RequestInit = {
    method: m,
    headers: config.headers,
  };
  if (method === 'POST' || method === 'PUT') {
    init.body = body;
  }
  if (method === 'DELETE') {
    clientUrl = `${clientUrl}/${body}`;
  }
  const req = new Request(clientUrl, init);

  return (await config.handlers[m](req)) as Response;
}
