import { apiRoutes } from '../../../../../utils/routes';
import { Config } from '../../../../../../utils/Config';
import fetch from '../../../../../utils/request';

/**
 * @swagger
 * /api/tenants/{tenantId}/invite/{inviteId}:
 *   delete:
 *    tags:
 *    - tenants
 *    summary: Deletes an invite on a tenant.
 *    operationId: deleteInvite
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "204":
 *        description: Tenant invite deleted
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
export async function DELETE(
  config: Config,
  init: RequestInit & { request: Request }
) {
  const yurl = new URL(init.request.url);
  const [inviteId, , tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  init.method = 'DELETE';
  const url = `${apiRoutes(config.apiUrl).INVITE(tenantId)}/${inviteId}`;

  return await fetch(url, init, config);
}
