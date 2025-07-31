import { apiRoutes } from '../../../../utils/routes';
import { Config } from '../../../../../utils/Config';
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
  config: Config,
  init: RequestInit & { request: Request }
) {
  const yurl = new URL(init.request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();

  const url = `${apiRoutes(config.apiUrl).TENANT_USERS(tenantId)}`;
  return await request(url, init, config);
}
