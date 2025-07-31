import { apiRoutes } from '../../../utils/routes';
import { Config } from '../../../../utils/Config';
import fetch from '../../../utils/request';

/**
 * @swagger
 * /api/tenants/{tenantId}:
 *   delete:
 *    tags:
 *    - tenants
 *    summary: Deletes a tenant.
 *    operationId: deleteTenant
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "204":
 *        description: Tenant deleted
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
  const [tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  init.method = 'DELETE';
  const url = `${apiRoutes(config.apiUrl).TENANT(tenantId)}`;

  return await fetch(url, init, config);
}
