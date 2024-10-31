import { Config } from '../../../utils/Config';
import urlMatches from '../../utils/routes/urlMatches';
import { Routes } from '../../types';

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
