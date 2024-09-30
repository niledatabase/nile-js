import { Config } from '../../../utils/Config';
import urlMatches from '../../utils/routes/urlMatches';
import { Routes } from '../../types';
import auth from '../../utils/auth';
import Logger from '../../../utils/Logger';

import { GET } from './GET';
import { GET as TENANT_GET } from './[tenantId]/GET';
import { DELETE } from './[tenantId]/DELETE';
import { PUT } from './[tenantId]/PUT';
import { POST } from './POST';

function isUUID(value: string | null | undefined) {
  if (!value) {
    return false;
  }
  // is any UUID
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5|7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  return regex.test(value);
}

const key = 'TENANTS';

export default async function route(request: Request, config: Config) {
  const { info } = Logger(
    { ...config, debug: config.debug } as Config,
    '[ROUTES]',
    `[${key}]`
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
      if (possibleTenantId) {
        return new Response(null, { status: 404 });
      }
      return await GET(config, session, { request }, info);
    case 'POST':
      return await POST(config, { request }, info);
    case 'DELETE':
      return await DELETE(config, { request }, info);
    case 'PUT':
      return await PUT(config, { request }, info);

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
