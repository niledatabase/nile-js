import { apiRoutes } from '../../../../../utils/routes/apiRoutes';
import fetch from '../../../../../utils/request';
import { ActiveSession } from '../../../../../utils/auth';

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
  session: ActiveSession,
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
  const url = `${apiRoutes.TENANT_USER(tenantId, userId)}`;
  log('[DELETE]', url);

  return await fetch(url, init);
}
