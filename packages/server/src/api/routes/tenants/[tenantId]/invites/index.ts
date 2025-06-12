import { Config } from '../../../../../utils/Config';
import { DefaultNileAuthRoutes, isUUID } from '../../../../utils/routes';
import { Routes } from '../../../../types';

import { GET } from './GET';

const key = 'INVITES';

export default async function route(request: Request, config: Config) {
  switch (request.method) {
    case 'GET':
      return await GET(config, { request });
    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  const url = new URL(request.url);
  const [, tenantId] = url.pathname.split('/').reverse();
  const route = configRoutes[key].replace('{tenantId}', tenantId);
  return url.pathname.endsWith(route);
}

export async function fetchInvites(config: Config) {
  if (!config.tenantId) {
    throw new Error(
      'Unable to fetch invites for the tenant, the tenantId context is missing. Call nile.setContext({ tenantId })'
    );
  }
  if (!isUUID(config.tenantId)) {
    config
      .logger('fetchInvites')
      .warn(
        'nile.tenantId is not a valid UUID. This may lead to unexpected behavior in your application.'
      );
  }
  const clientUrl = `${config.serverOrigin}${
    config.routePrefix
  }${DefaultNileAuthRoutes.INVITES.replace('{tenantId}', config.tenantId)}`;

  const req = new Request(clientUrl, { headers: config.headers });

  return (await config.handlers.GET(req)) as Response;
}
