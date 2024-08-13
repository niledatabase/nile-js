import { getTenantFromHttp } from '../../../utils/fetch';
import request from '../../utils/request';
import { apiRoutes } from '../../utils/routes/apiRoutes';

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *     - users
 *     summary: lists users in the tenant
 *     description: Returns information about the users within the tenant
 *       provided. You can also pass the a `niledb-tenantId` in the header or in a cookie.
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
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  const yurl = new URL(init.request.url);
  const tenantId = yurl.searchParams.get('tenantId');
  const tenant = tenantId ?? getTenantFromHttp(init.request.headers);

  if (!tenant) {
    log('[GET]', '[ERROR]', 'No tenant id provided.');
    return new Response(null, { status: 404 });
  }
  const url = apiRoutes.TENANT_USERS(tenant);
  log('[GET]', url);
  init.method = 'GET';
  return await request(url, init);
}
