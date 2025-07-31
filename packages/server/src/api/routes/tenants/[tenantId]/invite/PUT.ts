import { apiRoutes } from '../../../../utils/routes';
import { Config } from '../../../../../utils/Config';
import request from '../../../../utils/request';

/**
 * @swagger
 * /api/tenants/{tenantId}/invite:
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
  const [, tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    return new Response(null, { status: 404 });
  }
  // this came as a get request, convert it to a put
  if (yurl.searchParams.size > 0) {
    init.body = new URLSearchParams(yurl.searchParams).toString();
  }
  init.method = 'PUT';
  const url = `${apiRoutes(config.apiUrl).INVITE(tenantId)}`;

  const res = await request(url, init, config);
  const location = res?.headers?.get('location');
  if (location) {
    return new Response(res?.body, {
      status: 302,
      headers: res?.headers,
    });
  }
  return new Response(res?.body, {
    status: res?.status,
    headers: res?.headers,
  });
}
