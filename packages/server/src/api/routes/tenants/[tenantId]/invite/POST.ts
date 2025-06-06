import { apiRoutes } from '../../../../utils/routes';
import { Config } from '../../../../../utils/Config';
import fetch from '../../../../utils/request';

/**
 * @swagger
 * /api/tenants/{tenantId}/invite:
 *   post:
 *    tags:
 *    - tenants
 *    summary: Create an invite for a user in a tenant.
 *    operationId: invite
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "201":
 *        description: An email was sent to the user, inviting them to join the tenant
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
export async function POST(
  config: Config,
  init: RequestInit & { request: Request }
) {
  const yurl = new URL(init.request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  init.method = 'POST';
  init.body = init.request.body;
  const url = `${apiRoutes(config).INVITE(tenantId)}`;

  return await fetch(url, init, config);
}
