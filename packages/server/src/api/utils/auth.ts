import { Config } from '../../utils/Config';

import request from './request';

export type ProviderName =
  | 'discord'
  | 'github'
  | 'google'
  | 'hubspot'
  | 'linkedin'
  | 'slack'
  | 'twitter'
  | 'email' // magic link
  | 'credentials' // email + password
  | 'azure';

export type Providers = {
  [providerName in ProviderName]: Provider;
};
export type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

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
  const { info, error } = config.logger('[nileauth]');
  info('checking auth');

  const sessionUrl = `${config.apiUrl}/auth/session`;
  info(`using session ${sessionUrl}`);
  // handle the pass through with posts
  req.headers.delete('content-length');

  const res = await request(sessionUrl, { request: req }, config);
  const cloned = res.clone();
  try {
    const session = await new Response(res.body).json();
    if (Object.keys(session).length === 0) {
      info('no session found');
      return undefined;
    }
    info('session active');
    return session;
  } catch {
    error(cloned.text());
    return undefined;
  }
}
