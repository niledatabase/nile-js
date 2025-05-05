import { apiRoutes } from '../../../../../utils/routes';
import fetch from '../../../../../utils/request';
import { Config } from '../../../../../../utils/Config';

/**
 * @swagger
 * /api/tenants/{tenantId}/users/{userId}/link:
 *   delete:
 *    tags:
 *    - tenants
 *    summary: removes a user from a tenant
 *    description: removes an associated user from a specified
 *      tenant.
 *    operationId: leaveTenant 
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    - name: userId 
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    - name: email 
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 
 *    responses:
 *      "204":
 *        description: User removed
 */

export async function DELETE(
  config: Config,
  init: RequestInit & { request: Request }
) {
  const yurl = new URL(init.request.url);

  const [, userId, , tenantId] = yurl.pathname.split('/').reverse();
  config.tenantId = tenantId;
  config.userId = userId;

  init.method = 'DELETE';
  const url = `${apiRoutes(config).TENANT_USER}/link`;

  return await fetch(url, init, config);
}
