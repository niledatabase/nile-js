import { ActiveSession, JWT } from '../api/utils/auth';
import { appRoutes } from '../api/utils/routes/defaultRoutes';
import { Config } from '../utils/Config';
import { X_NILE_ORIGIN } from '../utils/constants';
import Logger from '../utils/Logger';
import Requester, { NileRequest } from '../utils/Requester';

// url host does not matter, we only match on the 1st leg by path
const ORIGIN = 'https://us-west-2.api.dev.thenile.dev';
/**
 * a helper function to log in server side.
 */
export function serverLogin(
  config: Config,
  handlers: {
    GET: (req: Request) => Promise<void | Response>;
    POST: (req: Request) => Promise<void | Response>;
    DELETE: (req: Request) => Promise<void | Response>;
    PUT: (req: Request) => Promise<void | Response>;
  }
) {
  const { info, error, debug } = Logger(config, '[server side login]');
  const routes = appRoutes(config.api.routePrefix);
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

    const sessionUrl = new URL(`${ORIGIN}${routes.PROVIDERS}`);
    const baseHeaders = {
      host: sessionUrl.host,
      [X_NILE_ORIGIN]: ORIGIN,
    };
    info(`Obtaining providers for ${email}`);
    const sessionReq = new Request(sessionUrl, {
      method: 'GET',
      ...baseHeaders,
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
        ...baseHeaders,
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
      debug('CSRF failed', { headers: csrfRes?.headers });
      throw new Error('Unable to authenticate REST, CSRF missing.');
    }
    info(`Attempting sign in with email ${email} ${signInUrl.href}`);
    const body = JSON.stringify({
      email,
      password,
      csrfToken,
      callbackUrl: credentials.callbackUrl,
    });
    const postReq = new Request(signInUrl, {
      method: 'POST',
      headers: new Headers({
        ...baseHeaders,
        'content-type': 'application/json',
        cookie: csrfCookie.split(',').join('; '),
      }),
      body,
    });

    const loginRes = await handlers.POST(postReq);
    const authCookie = loginRes?.headers.get('set-cookie');
    if (!authCookie) {
      throw new Error('authentication failed');
    }
    const [, token] =
      /((__Secure-)?nile\.session-token=.+?);/.exec(authCookie) ?? [];
    if (!token) {
      error('Unable to obtain auth token', { authCookie });
      throw new Error('Server login failed');
    }
    info('Server login successful', { authCookie, csrfCookie });
    const headers = new Headers({
      ...baseHeaders,
      cookie: [token, csrfCookie].join('; '),
    });
    return headers;
  };
}

export default class Auth extends Config {
  headers?: Headers;
  constructor(config: Config, headers?: Headers) {
    super(config);
    this.headers = headers;
  }
  handleHeaders(init?: RequestInit) {
    if (this.headers) {
      if (init) {
        init.headers = new Headers({ ...this.headers, ...init?.headers });
        return init;
      } else {
        init = {
          headers: this.headers,
        };
        return init;
      }
    }
    return undefined;
  }

  get sessionUrl() {
    return '/auth/session';
  }
  getSession = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<JWT | ActiveSession | Response | undefined> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    const session = await _requester.get(req, this.sessionUrl, _init);
    if (Object.keys(session).length === 0) {
      return undefined;
    }
    return session as JWT | ActiveSession | Response;
  };
}
