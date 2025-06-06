import request from '../../../../utils/request';
import { apiRoutes } from '../../../../utils/routes';
import { Config } from '../../../../../utils/Config';
/**
 * @swagger
 * /api/tenants/{tenantId}/invites:
 *   get:
 *    tags:
 *    - tenants
 *    summary: Lists invites for a tenant.
 *    operationId: listInvites
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "200":
 *        description: A list of tenant invites
 *      "401":
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/APIError'
 *      "404":
 *        description: Tenant not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/APIError'
 */
export async function GET(
  config: Config,
  init: RequestInit & { request: Request }
) {
  const yurl = new URL(init.request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  init.method = 'GET';
  const url = `${apiRoutes(config).INVITES(tenantId)}`;

  return await request(url, init, config);
}
