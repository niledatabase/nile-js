import { appRoutes } from '../api/utils/routes/defaultRoutes';
import { Config } from '../utils/Config';
import Logger from '../utils/Logger';

// url host does not matter, we only match on the 1st leg by path
const ORIGIN = 'http://localhost';
/**
 * a helper function to log in server side.
 */
export default function serverAuth(
  config: Config,
  handlers: {
    GET: (req: Request) => Promise<void | Response>;
    POST: (req: Request) => Promise<void | Response>;
    DELETE: (req: Request) => Promise<void | Response>;
    PUT: (req: Request) => Promise<void | Response>;
  }
) {
  const { info, error } = Logger(config, '[server side login]');
  const routes = appRoutes(config.routePrefix);
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

    info(`Obtaining providers for ${email}`);
    const sessionUrl = new URL(`${ORIGIN}${routes.PROVIDERS}`);
    const sessionReq = new Request(sessionUrl, {
      method: 'GET',
      headers: new Headers({
        host: sessionUrl.host,
      }),
    });
    const sessionRes = await handlers.POST(sessionReq);

    if (sessionRes?.status === 404) {
      throw new Error('Unable to login, cannot find region api.');
    }

    let providers;
    try {
      providers = await sessionRes?.json();
    } catch (e) {
      info(sessionUrl, { sessionRes });
      error(e);
    }

    info('Obtaining csrf');
    const csrf = new URL(`${ORIGIN}${routes.CSRF}`);
    const csrfReq = new Request(csrf, {
      method: 'GET',
      headers: new Headers({
        host: sessionUrl.host,
      }),
    });
    const csrfRes = await handlers.POST(csrfReq);
    let csrfToken;
    try {
      const json = (await csrfRes?.json()) ?? {};
      csrfToken = json?.csrfToken;
    } catch (e) {
      info(sessionUrl, { csrfRes });
      error(e, { csrfRes });
    }

    const { credentials } = providers ?? {};

    const csrfCookie = csrfRes?.headers.get('set-cookie');

    if (!credentials) {
      throw new Error(
        'Unable to obtain credential provider. Aborting server side login.'
      );
    }
    const signInUrl = new URL(credentials.callbackUrl);

    if (!csrfCookie) {
      throw new Error('Unable to authenticate REST');
    }
    info(`Attempting sign in with email ${email}`);
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
    const loginRes = await handlers.POST(postReq);
    const authCookie = loginRes?.headers.get('set-cookie');
    if (!authCookie) {
      throw new Error('authentication failed');
    }
    const [, token] = /(nile\.session-token=.+?);/.exec(authCookie) ?? [];
    if (!token) {
      throw new Error('Server login failed');
    }
    info('Server login successful', { authCookie, csrfCookie });
    return new Headers({
      cookie: [token, csrfCookie].join('; '),
    });
  };
}
