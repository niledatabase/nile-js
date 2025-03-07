import { getTenantFromHttp } from '../../../utils/fetch';
import request from '../../utils/request';
import { apiRoutes } from '../../utils/routes/apiRoutes';
import { Config } from '../../../utils/Config';

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *     - users
 *     summary: lists users in the tenant
 *     description: Returns information about the users within the tenant
 *       provided. You can also pass the a `nile.tenant_id` in the header or in a cookie.
 *     operationId: listUsers
 *     parameters:
 *       - name: tenantId
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                $ref: '#/components/schemas/TenantUser'
 *       "404":
 *         description: Not found
 *         content: {}
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */
export async function GET(
  config: Config,
  init: RequestInit & { request: Request },
  log: (message: string | unknown, meta?: Record<string, unknown>) => void
) {
  const yurl = new URL(init.request.url);
  const tenantId = yurl.searchParams.get('tenantId');
  const tenant = tenantId ?? getTenantFromHttp(init.request.headers);

  if (!tenant) {
    log('[GET] No tenant id provided.');
    return new Response(null, { status: 404 });
  }
  const url = apiRoutes(config).TENANT_USERS(tenant);
  init.method = 'GET';
  return await request(url, init, config);
}
