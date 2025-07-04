import { getTenantFromHttp } from '../../../utils/fetch';
import request from '../../utils/request';
import { apiRoutes } from '../../utils/routes';
import { Config } from '../../../utils/Config';
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - users
 *     summary: Creates a user
 *     description: Creates a user in the database
 *     operationId: createUser
 *     parameters:
 *       - name: tenantId
 *         description: A tenant id to add the user to when they are created
 *         in: query
 *         schema:
 *           type: string
 *       - name: newTenantName
 *         description: A tenant name to create, then the user to when they are created
 *         in: query
 *         schema:
 *           type: string
 *     requestBody:
 *       description: |-
 *         The email and password combination the user will use to authenticate.
 *         The `name` is optional; if provided it will be recorded in the `users` table.
 *         The `newTenant` is optional; if provided, it is used as the name of a new tenant record associated with the newly created user.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBasicUserRequest'
 *           examples:
 *             Create User Request:
 *               summary: Creates a user with basic credentials
 *               description: Create User Request
 *               value:
 *                 email: a.user@somedomain.com
 *                 password: somepassword
 *                 name: A. User
 *             Create User Request with Tenant:
 *               summary: Creates a user and a new tenant for that user
 *               description: Create User Request with Tenant
 *               value:
 *                 email: a.user@somedomain.com
 *                 password: somepassword
 *                 name: A. User
 *                 newTenant: My Sandbox
 *     responses:
 *       "201":
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       "400":
 *         description: API/Database failures
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */

export async function POST(
  config: Config,
  init: RequestInit & { request: Request }
) {
  init.body = init.request.body;
  init.method = 'POST';
  const yurl = new URL(init.request.url);
  const tenantId = yurl.searchParams.get('tenantId');
  const newTenantName = yurl.searchParams.get('newTenantName');
  const tenant = tenantId ?? getTenantFromHttp(init.request.headers, config);

  const url = apiRoutes(config).USERS({ tenantId: tenant, newTenantName });

  return await request(url, init, config);
}
