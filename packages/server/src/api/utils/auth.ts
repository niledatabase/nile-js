import { Config } from '../../utils/Config';
import Logger from '../../utils/Logger';

import request from './request';

export type ActiveSession = {
  id: string;
  email: string;
  expires: Date;
  user?: {
    id: string;
    name: string;
    image: string;
    email: string;
    emailVerified: void | Date;
  };
};
export default async function auth(
  req: Request,
  config: Config
): Promise<void | ActiveSession> {
  const { info } = Logger({ ...config, debug: config.debug }, '[nileauth]');
  info('checking auth');

  const sessionUrl = `${config.api.basePath}/auth/session`;
  info('using session', sessionUrl);
  // handle the pass through with posts
  req.headers.delete('content-length');

  const res = await request(sessionUrl, { request: req }, config);
  if (!res) {
    info('no session found');
    return undefined;
  }
  info('session active');
  return await new Response(res.body).json();
}
