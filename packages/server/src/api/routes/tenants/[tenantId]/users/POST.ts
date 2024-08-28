import { ActiveSession } from '../../../../utils/auth';
import fetch from '../../../../utils/request';
import { apiRoutes } from '../../../../utils/routes/apiRoutes';
import { Config } from '../../../../../utils/Config';

/**
 * @swagger
 * /api/tenants/{tenantId}/users:
 *   post:
 *    tags:
 *    - users
 *    summary: Create a user in a tenant
 *    description: Creates a new user and associates that user with the specified
 *      tenant.
 *    operationId: createTenantUser
 *    parameters:
 *    - name: tenantId
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    requestBody:
 *      description: |
 *        The email and password combination the user will use to authenticate.
 *        The `name` is optional; if provided it will be recorded in the `users` table.
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateBasicUserRequest'
 *          examples:
 *            Create User Request:
 *              summary: Creates a user with basic credentials
 *              description: Create User Request
 *              value:
 *                email: a.user@somedomain.com
 *                password: somepassword
 *                name: A. User
 *    responses:
 *      "201":
 *        description: User created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
export async function POST(
  config: Config,
  session: ActiveSession,
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  const yurl = new URL(init.request.url);
  const [, tenantId] = yurl.pathname.split('/').reverse();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  init.body = JSON.stringify({ email: session.email });
  init.method = 'PUT';
  const url = apiRoutes(config).TENANT_USERS(tenantId);
  log('[PUT]', url);

  return await fetch(url, init);
}
