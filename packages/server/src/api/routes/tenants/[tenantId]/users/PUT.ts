import { apiRoutes } from '../../../../utils/routes/apiRoutes';
import fetch from '../../../../utils/request';
import { Config } from '../../../../../utils/Config';
/**
 * @swagger
 * /api/tenants/{tenantId}/users:
 *   put:
 *    tags:
 *    - tenants
 *    summary: associates an existing user with the tenant
 *    operationId: linkUser
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      description: |
 *        The email of the user you want to add to a tenant.
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AssociateUserRequest'
 *    responses:
 *      "201":
 *        description: add user to tenant
 */

export async function PUT(
  config: Config,
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  const yurl = new URL(init.request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }

  init.method = 'PUT';
  const url = `${apiRoutes(config).TENANT_USERS(tenantId)}`;
  log('[PUT]', url);

  return await fetch(url, init);
}
