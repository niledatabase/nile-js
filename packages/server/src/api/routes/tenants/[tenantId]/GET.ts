import { apiRoutes } from '../../../utils/routes';
import { Config } from '../../../../utils/Config';
import request from '../../../utils/request';

/**
 * @swagger
 * /api/tenants/{tenantId}:
 *   get:
 *    tags:
 *    - tenants
 *    summary: Obtains a specific tenant.
 *    operationId: getTenant
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      "200":
 *       description: the desired tenant
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Tenant'
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
export async function GET(
  config: Config,
  init: RequestInit & { request: Request },
  log: (message: string | unknown, meta?: Record<string, unknown>) => void
) {
  const yurl = new URL(init.request.url);
  const [tenantId] = yurl.pathname.split('/').reverse();
  if (!tenantId) {
    log('[GET] No tenant id provided.');
    return new Response(null, { status: 404 });
  }

  init.method = 'GET';
  const url = `${apiRoutes(config.apiUrl).TENANT(tenantId)}`;

  return await request(url, init, config);
}
