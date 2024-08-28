import { Config } from '../../../utils/Config';
import request from '../../utils/request';
import { apiRoutes } from '../../utils/routes/apiRoutes';

/**
 * @swagger
 * /api/tenants:
 *   post:
 *    tags:
 *    - tenants
 *    summary: Create a tenant
 *    description: Creates a new tenant in a database.
 *    operationId: createTenant
 *    requestBody:
 *      description: A wrapper for the tenant name.
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateTenantRequest'
 *          examples:
 *            Create Tenant Request:
 *              summary: Creates a named tenant
 *              description: Create Tenant Request
 *              value:
 *                name: My Sandbox
 *    responses:
 *      "201":
 *        description: Tenant created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tenant'
 *      "401":
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/APIError'
 *      "404":
 *        description: Database not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/APIError'
 */
export async function POST(
  config: Config,
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  init.body = init.request.body;
  init.method = 'POST';
  const url = `${apiRoutes(config).TENANTS}`;
  log('[POST]', url);

  return await request(url, init, config);
}
