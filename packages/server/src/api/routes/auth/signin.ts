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
import { Config } from '../../../utils/Config';
import { NileAuthRoutes, proxyRoutes, urlMatches } from '../../utils/routes';
import request from '../../utils/request';

const key = 'SIGNIN';

export default async function route(req: Request, config: Config) {
  let url = proxyRoutes(config)[key];

  const init: RequestInit = {
    method: req.method,
    headers: req.headers,
  };
  if (req.method === 'POST') {
    const [provider] = new URL(req.url).pathname.split('/').reverse();

    url = `${proxyRoutes(config)[key]}/${provider}`;
  }

  const passThroughUrl = new URL(req.url);
  const params = new URLSearchParams(passThroughUrl.search);

  url = `${url}${params.toString() !== '' ? `?${params.toString()}` : ''}`;

  const res = await request(url, { ...init, request: req }, config);

  return res;
}
export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

// this is not for the the credential provider STILL NEED TO FIGURE THIS OUT I THINK? or remove.
export async function fetchSignIn(
  config: Config,
  provider: string,
  body: URLSearchParams
): Promise<Response> {
  const clientUrl = `${config.serverOrigin}${config.routePrefix}${NileAuthRoutes.SIGNIN}/${provider}`;
  const req = new Request(clientUrl, {
    method: 'POST',
    headers: config.headers,
    body,
  });
  return (await config.handlers.POST(req)) as Response;
}
