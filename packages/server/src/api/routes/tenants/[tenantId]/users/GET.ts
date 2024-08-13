import { apiRoutes } from '../../../../utils/routes/apiRoutes';
import { ActiveSession } from '../../../../utils/auth';
import request from '../../../../utils/request';

/**
 * @swagger
 * /api/tenants/{tenantId}/users:
 *  get:
 *    tags:
 *    - users
 *    summary: List tenant users
 *    description: Lists users that are associated with the specified tenant.
 *    operationId: listTenantUsers
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "200":
 *        description: Users found
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 *      "401":
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/APIError'
 */
export async function GET(
  session: ActiveSession,
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  const yurl = new URL(init.request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  const url = `${apiRoutes.TENANT_USERS(tenantId)}`;
  log('[GET]', '[TENANT_USERS]', url);
  return await request(url, init);
}
