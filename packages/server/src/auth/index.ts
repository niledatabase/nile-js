import { proxyRoutes } from '../api/utils/routes/proxyRoutes';
import { Config } from '../utils/Config';
import Logger from '../utils/Logger';

/**
 * a helper function to log in server side.
 */
export default function login(config: Config) {
  const { info, error } = Logger(config, '[server side login]');
  const routes = proxyRoutes(config);
  return async function login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    if (!email || !password) {
      throw new Error('Server side login requires a user email and password.');
    }

    info('Obtaining providers for', email);
    const sessionUrl = new URL(routes.PROVIDERS);
    const sessionReq = new Request(sessionUrl, {
      method: 'GET',
      headers: new Headers({
        host: sessionUrl.host,
      }),
    });
    const sessionRes = await fetch(sessionReq);
    let providers;
    try {
      providers = await sessionRes?.json();
    } catch (e) {
      info(sessionUrl, sessionRes);
      error(e);
    }

    info('Obtaining csrf');
    const csrf = new URL(routes.CSRF);
    const csrfReq = new Request(csrf, {
      method: 'GET',
      headers: new Headers({
        host: sessionUrl.host,
      }),
    });
    const csrfRes = await fetch(csrfReq);
    let csrfToken;
    try {
      const json = (await csrfRes?.json()) ?? {};
      csrfToken = json?.csrfToken;
    } catch (e) {
      info(sessionUrl, csrfRes);
      error(e, csrfRes);
    }

    const { credentials } = providers ?? {};

    const csrfCookie = csrfRes?.headers.get('set-cookie');

    if (!credentials) {
      throw new Error(
        'Unable to obtain credential provider. Aborting server side login.'
      );
    }
    const signInUrl = new URL(routes.SIGNIN);

    if (!csrfCookie) {
      throw new Error('Unable to authenticate REST');
    }
    info('Attempting sign in via proxy', signInUrl.href, 'with email', email);
    const postReq = new Request(signInUrl, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        cookie: csrfCookie,
      }),
      body: JSON.stringify({
        email,
        password,
        csrfToken,
        callbackUrl: credentials.callbackUrl,
      }),
    });
    const loginRes = await fetch(postReq);
    const authCookie = loginRes?.headers.get('set-cookie');
    if (!authCookie) {
      throw new Error('authentication failed');
    }
    const [, token] = /(nile\.session-token=.+?);/.exec(authCookie) ?? [];
    info('Server login successful', authCookie, csrfCookie);
    return new Headers({
      cookie: [token, csrfCookie].join('; '),
    });
  };
}
