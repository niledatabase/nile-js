import Logger from '../../../utils/Logger';
import { Routes } from '../../types';
import { apiRoutes } from '../../utils/routes/apiRoutes';
import urlMatches from '../../utils/routes/urlMatches';
import { Config } from '../../../utils/Config';
import request from '../../utils/request';

const key = 'ME';
const url = apiRoutes[key];

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Identify the principal
 *     description: Returns information about the principal associated with the session
 *       provided
 *     operationId: me
 *     responses:
 *       "200":
 *         description: Identified user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         description: API/Database failures
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       "404":
 *         description: Not found
 *         content: {}
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */

async function GET(
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  log('[GET]', url);
  const res = await request(url, init);
  return res;
}

export default async function route(request: Request, config: Config) {
  const { info } = Logger(
    { ...config, debug: config.debug },
    '[ROUTES]',
    `[${key}]`
  );

  switch (request.method) {
    case 'GET':
      return await GET({ request }, info);

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
