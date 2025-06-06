import { apiRoutes } from '../../../utils/routes';
import fetch from '../../../utils/request';
import { Config } from '../../../../utils/Config';

/**
 * @swagger
 * /api/users/{userid}:
 *   put:
 *     tags:
 *     - users
 *     summary: update a user
 *     description: updates a user within the tenant
 *     operationId: updateUser
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: |-
 *         Update a user
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       "200":
 *         description: An updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: Not found
 *         content: {}
 *       "401":
 *         description: Unauthorized
 *         content: {}
 */

export async function PUT(
  config: Config,
  init: RequestInit & { request: Request }
) {
  init.body = init.request.body;
  init.method = 'PUT';

  // update the user

  const [userId] = new URL(init.request.url).pathname.split('/').reverse();

  const url = apiRoutes(config).USER(userId);

  return await fetch(url, init, config);
}
