import { Routes } from '../../types';
import { Config } from '../../../utils/Config';
import request from '../../utils/request';
import {
  urlMatches,
  apiRoutes,
  DefaultNileAuthRoutes,
} from '../../utils/routes';
import auth from '../../utils/auth';

const key = 'ME';

export default async function route(request: Request, config: Config) {
  const url = apiRoutes(config)[key];

  if (request.method === 'GET') {
    return await GET(url, { request }, config);
  }
  if (request.method === 'PUT') {
    return await PUT(url, { request }, config);
  }
  if (request.method === 'DELETE') {
    const session = await auth(request, config);
    if (!session) {
      return new Response(null, { status: 401 });
    }
    return await DELETE(url, { request }, config);
  }
  return new Response('method not allowed', { status: 405 });
}

export function matches(configRoutes: Routes, request: Request): boolean {
  return urlMatches(request.url, configRoutes[key]);
}

export async function fetchMe(
  config: Config,
  method?: 'DELETE' | 'PUT',
  body?: string
): Promise<Response> {
  const clientUrl = `${config.origin}${config.routePrefix}${DefaultNileAuthRoutes.ME}`;
  const init: RequestInit = {
    headers: config.headers,
    method: method ?? 'GET',
  };
  if (method === 'PUT') {
    init.body = body;
  }

  const req = new Request(clientUrl, init);
  if (method === 'DELETE') {
    return (await config.handlers.DELETE(req)) as Response;
  }
  if (method === 'PUT') {
    return (await config.handlers.PUT(req)) as Response;
  }
  return (await config.handlers.GET(req)) as Response;
}

/**
 * @swagger
 * /api/me:
 *   delete:
 *     tags:
 *       - users
 *     summary: soft deletes a user
 *     description: marks the current user for deletion. Can only be done by the current user for the current user
 *     operationId: removeSelf
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: success if the user was deleted
 *         content: {}
 *       "404":
 *         description: Not found
 *         content: {}
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */

export async function DELETE(
  url: string,
  init: RequestInit & { request: Request },
  config: Config
) {
  init.method = 'DELETE';

  return await request(url, init, config);
}
/**
 * @swagger
 * /api/me:
 *   put:
 *     tags:
 *       - users
 *     summary: updates the current user
 *     description: changes the data for the current user
 *     operationId: updateSelf
 *     responses:
 *       "200":
 *         description: success if the user was deleted
 *         content: {}
 *       "404":
 *         description: Not found
 *         content: {}
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */

export async function PUT(
  url: string,
  init: RequestInit & { request: Request },
  config: Config
) {
  init.method = 'PUT';

  return await request(url, init, config);
}

/**
 * @swagger
 * /api/me:
 *   get:
 *     tags:
 *       - users
 *     summary: Identify the principal
 *     description: Returns information about the principal associated with the session
 *       provided
 *     operationId: getSelf
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
