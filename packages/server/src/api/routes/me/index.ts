import { Routes } from '../../types';
import { apiRoutes } from '../../utils/routes/apiRoutes';
import urlMatches from '../../utils/routes/urlMatches';
import { Config } from '../../../utils/Config';
import request from '../../utils/request';

const key = 'ME';

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
  url: string,
  init: RequestInit & { request: Request },
  config: Config
) {
  const res = await request(url, init, config);
  return res;
}

export default async function route(request: Request, config: Config) {
  const url = apiRoutes(config)[key];

  switch (request.method) {
    case 'GET':
      return await GET(url, { request }, config);

    default:
      return new Response('method not allowed', { status: 405 });
  }
}

export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
