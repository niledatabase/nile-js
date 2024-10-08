import { Config } from '../../../../utils/Config';
import fetch from '../../../utils/request';
import { apiRoutes } from '../../../utils/routes/apiRoutes';

/**
 * @swagger
 * /api/tenants/{tenantId}:
 *   put:
 *    tags:
 *    - tenants
 *    summary: Obtains a specific tenant.
 *    operationId: updateTenant
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "201":
 *        description: update an existing tenant
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/Tenant'
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
export async function PUT(
  config: Config,
  init: RequestInit & { request: Request }
) {
  const yurl = new URL(init.request.url);
  const [tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }
  init.body = init.request.body;
  init.method = 'PUT';
  const url = `${apiRoutes(config).TENANT(tenantId)}`;

  return await fetch(url, init, config);
}
