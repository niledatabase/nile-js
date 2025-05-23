import { Config } from '../../../utils/Config';
import { Routes } from '../../types';
import { urlMatches, DefaultNileAuthRoutes } from '../../utils/routes';

import { POST } from './POST';

const key = 'SIGNUP';

export default async function route(request: Request, config: Config) {
  switch (request.method) {
    case 'POST':
      return await POST(config, { request });

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchSignUp(
  config: Config,
  payload: {
    body?: string;
    params?: { newTenantName?: string; tenantId?: string };
  }
): Promise<Response> {
  const { body, params } = payload ?? {};
  const q = new URLSearchParams();
  if (params?.newTenantName) {
    q.set('newTenantName', params.newTenantName);
  }
  if (params?.tenantId) {
    q.set('tenantId', params.tenantId);
  }
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${
    DefaultNileAuthRoutes.SIGNUP
  }${q.size > 0 ? `?${q}` : ''}`;
  const req = new Request(clientUrl, {
    method: 'POST',
    headers: config.headers,
    body,
  });

  return (await config.handlers.POST(req)) as Response;
}
