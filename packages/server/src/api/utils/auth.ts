import { Config } from '../../utils/Config';
import Logger from '../../utils/Logger';

import request from './request';

export type ActiveSession = { id: string; email: string };
export default async function auth(
  req: Request,
  config: Config
): Promise<void | ActiveSession> {
  const { info } = Logger({ ...config, debug: true }, '[nileauth]');
  info('checking auth');

  const sessionUrl = `${config.api.basePath}/auth/session`;
  info('using session', sessionUrl);

  const res = await request(sessionUrl, { request: req });
  if (!res) {
    info('no session found');
    return undefined;
  }
  info('session active');
  return await new Response(res.body).json();
}
