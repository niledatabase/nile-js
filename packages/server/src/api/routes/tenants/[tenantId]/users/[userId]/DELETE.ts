import { apiRoutes } from '../../../../../utils/routes/apiRoutes';
import fetch from '../../../../../utils/request';
import { Config } from '../../../../../../utils/Config';

/**
 * @swagger
 * /api/tenants/{tenantId}/users/{email}:
 *   delete:
 *    tags:
 *    - tenants
 *    summary: removes a user from a tenant
 *    description: removes an associated user from a specified
 *      tenant.
 *    operationId: unlinkUser 
 *    parameters:
 *    - name: tenantId
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
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  const yurl = new URL(init.request.url);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, _, tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  init.method = 'DELETE';
  init.body = JSON.stringify({ email: userId });
  const url = `${apiRoutes(config).TENANT_USER(tenantId, userId)}`;
  log('[DELETE]', url);

  return await fetch(url, init, config);
}
