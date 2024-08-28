import { Config } from '../../../utils/Config';
import { ActiveSession } from '../../utils/auth';
import request from '../../utils/request';
import { apiRoutes } from '../../utils/routes/apiRoutes';

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     tags:
 *       - tenants
 *     summary: list tenants by user
 *     description: Creates a user in the database
 *     operationId: listTenants
 *     responses:
 *       "200":
 *         description: a list of tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                $ref: "#/components/schemas/Tenant"
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
export async function GET(
  config: Config,
  session: ActiveSession,
  init: RequestInit & { request: Request },
  log: (...args: string[]) => void
) {
  let url = `${apiRoutes(config).USER_TENANTS(session.id)}`;
  if (typeof session === 'object' && 'user' in session && session.user) {
    url = `${apiRoutes(config).USER_TENANTS(session.user.id)}`;
  }
  log('[GET]', url);

  const res = await request(url, init);
  return res;
}
