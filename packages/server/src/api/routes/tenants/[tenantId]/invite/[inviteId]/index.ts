import { urlMatches } from '../../../../../utils/routes';
import { Routes } from '../../../../../types';
import { Config } from '../../../../../../utils/Config';

import { DELETE } from './DELETE';

const key = 'INVITE';
export default async function route(request: Request, config: Config) {
  switch (request.method) {
    case 'DELETE':
      return await DELETE(config, { request });
    default:
      return new Response('method not allowed', { status: 405 });
  }
}
export function matches(configRoutes: Routes, request: Request): boolean {
  const url = new URL(request.url);
  const [inviteId, , tenantId] = url.pathname.split('/').reverse();
  const route = configRoutes[key]
    .replace('{tenantId}', tenantId)
    .replace('{inviteId}', inviteId);
  return urlMatches(request.url, route);
}
