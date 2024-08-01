/**
 * @swagger
 * /api/auth/signin:
 *   get:
 *     tags:
 *     - authentication
 *     summary: lists users in the tenant
 *     description: Returns information about the users within the tenant
 *       provided
 *     operationId: signin
 *     parameters:
 *       - name: tenantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: Not found
 *         content: {}
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */

import { Routes } from '../../types';
import { proxyRoutes } from '../../utils/routes/proxyRoutes';
import fetch from '../../utils/request';
import urlMatches from '../../utils/routes/urlMatches';

const key = 'SIGNIN';

export default async function route(request: Request) {
  let url = proxyRoutes[key];

  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === 'POST') {
    init.body = request.body;
    const [provider] = new URL(request.url).pathname.split('/').reverse();

    url = `${proxyRoutes[key]}/${provider}`;
  }

  const passThroughUrl = new URL(request.url);
  const params = new URLSearchParams(passThroughUrl.search);

  url = `${url}${params.toString() !== '' ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, { ...init, request });

  return res;
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}
