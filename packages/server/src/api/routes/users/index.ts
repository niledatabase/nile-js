import { Routes } from '../../types';
import urlMatches from '../../utils/routes/urlMatches';
import auth from '../../utils/auth';
import { Config } from '../../../utils/Config';
import Logger from '../../../utils/Logger';

import { POST } from './POST';
import { GET } from './GET';
import { PUT } from './[userId]/PUT';

const key = 'USERS';

export default async function route(request: Request, config: Config) {
  const { info } = Logger({ ...config, debug: true }, '[ROUTES]', `[${key}]`);
  const session = await auth(request, config);

  switch (request.method) {
    case 'GET':
      return await GET({ request }, info);
    case 'POST':
      return await POST(session, { request }, info);
    case 'PUT':
      return await PUT(session, { request }, info);

    default:
      return new Response('method not allowed', { status: 405 });
  }
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
