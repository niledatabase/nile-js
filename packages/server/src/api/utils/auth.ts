import { Config } from '../../utils/Config';
import Logger from '../../utils/Logger';

import request from './request';

export type JWT = {
  email: string;
  sub: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
};

export type ActiveSession = {
  id: string;
  email: string;
  expires: string;
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
): Promise<null | undefined | ActiveSession> {
  const { info, error } = Logger(config, '[nileauth]');
  info('checking auth');

  const sessionUrl = `${config.api.basePath}/auth/session`;
  info(`using session${sessionUrl}`);
  // handle the pass through with posts
  req.headers.delete('content-length');

  const res = await request(sessionUrl, { request: req }, config);
  if (!res) {
    info('no session found');
    return undefined;
  }
  info('session active');
  try {
    const session = await new Response(res.body).json();
    if (Object.keys(session).length === 0) {
      return undefined;
    }
    return session;
  } catch (e) {
    error(e);
    return undefined;
  }
}
