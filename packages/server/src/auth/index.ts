import { ActiveSession, JWT, Provider } from '../api/utils/auth';
import { appRoutes } from '../api/utils/routes/defaultRoutes';
import { Config } from '../utils/Config';
import { X_NILE_ORIGIN } from '../utils/constants';
import Logger from '../utils/Logger';
import Requester, { NileRequest } from '../utils/Requester';

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
  // this really matters now for reset password.
  const ORIGIN = config.api.origin;
  const { info, error, debug } = Logger(config, '[server side login]');
  const routes = appRoutes(config.api.routePrefix);
  return async function login<T = Response | Headers | Error>(
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    },
    loginConfig?: {
      setCookie?: boolean;
    }
  ) {
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

    if (loginConfig?.setCookie) {
      return loginRes as T;
    }

    const [, token] =
      /((__Secure-)?nile\.session-token=.+?);/.exec(authCookie) ?? [];
    if (!token) {
      error('Unable to obtain auth token', { authCookie });
      throw new Error('Server login failed');
    }
    info('Server login successful');
    const headers = new Headers({
      ...baseHeaders,
      cookie: parseCookies([token, csrfCookie].join(', ')).join('; '),
    });
    return headers as T;
  };
}

function parseCookies(cookieString: string | null): string[] {
  if (!cookieString) return [];

  return cookieString
    .split(/,\s*(?=[^;]+=[^;,]+)/) // Split correctly when multiple cookies are present
    .flatMap(
      (cookie) => cookie.split('; ').slice(0, 1) // Extract only key=value pair
    );
}

export default class Auth extends Config {
  headers?: Headers;
  resetHeaders?: (headers?: Headers) => void;
  constructor(
    config: Config,
    headers?: Headers,
    params?: { resetHeaders: () => void }
  ) {
    super(config);
    this.headers = headers;
    this.resetHeaders = params?.resetHeaders;
  }
  handleHeaders(init?: RequestInit) {
    if (this.headers) {
      const cburl = getCallbackUrl(this.headers);
      if (cburl) {
        try {
          this.headers.set(X_NILE_ORIGIN, new URL(cburl).origin);
        } catch (e) {
          if (this.logger?.debug) {
            this.logger.debug('Invalid URL supplied by cookie header');
          }
        }
      }
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

  getSession = async <T = JWT | ActiveSession | Response | undefined>(
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    const session = await _requester.get(req, this.sessionUrl, _init);
    if (Object.keys(session).length === 0) {
      return undefined as T;
    }
    return session as T;
  };

  get getCsrfUrl() {
    return '/auth/csrf';
  }

  async getCsrf<T = Response | JSON>(
    req: NileRequest<void> | Headers,
    init?: RequestInit,
    raw = false
  ) {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return (await _requester.get(req, this.getCsrfUrl, _init, raw)) as T;
  }
  get listProvidersUrl() {
    return '/auth/providers';
  }

  listProviders = async <T = Response | { [key: string]: Provider }>(
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return (await _requester.get(req, this.listProvidersUrl, _init)) as T;
  };

  get signOutUrl() {
    return '/auth/signout';
  }

  signOut = async <T = Response | { url: string }>(
    req: NileRequest<void | { callbackUrl?: string }> | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);

    const csrf = await this.getCsrf<Response>(
      req as NileRequest<void>,
      undefined,
      true
    );
    const csrfHeader = getCsrfToken(csrf.headers);
    const callbackUrl =
      req && 'callbackUrl' in req ? String(req.callbackUrl) : '/';

    if (!csrfHeader) {
      return new Response('Request blocked', { status: 400 }) as T;
    }

    const headers = new Headers(_init?.headers);
    const { csrfToken } = (await csrf.json()) ?? {};
    const cooks = getCookies(headers);
    if (csrfHeader) {
      if (cooks['__Secure-nile.csrf-token']) {
        cooks['__Secure-nile.csrf-token'] = encodeURIComponent(csrfHeader);
      }
      if (cooks['nile.csrf-token']) {
        cooks['nile.csrf-token'] = encodeURIComponent(csrfHeader);
      }
    }

    headers.set(
      'cookie',
      Object.keys(cooks)
        .map((key) => `${key}=${cooks[key]}`)
        .join('; ')
    );
    const res = await _requester.post(req, this.signOutUrl, {
      method: 'post',
      body: JSON.stringify({
        csrfToken,
        callbackUrl,
        json: String(true),
      }),
      ..._init,
      headers,
    });

    this.resetHeaders && this.resetHeaders();

    return res as T;
  };

  get resetPasswordUrl() {
    return '/auth/reset-password';
  }

  resetPassword = async <T = Response | { url: string }>(
    req:
      | NileRequest<{
          email: string;
          password: string;
          callbackUrl?: string;
          redirectUrl?: string;
        }>
      | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    const headers = new Headers(_init?.headers);

    let email = '';
    let password = '';
    let callbackUrl = null;
    if (req instanceof Request) {
      const body = await req.json();
      email = body.email;
      password = body.password;
      const cbFromHeaders = getCallbackUrl(req.headers);
      if (cbFromHeaders) {
        callbackUrl = cbFromHeaders;
      }
      if (body.callbackUrl) {
        callbackUrl = body.callbackUrl;
      }
    } else {
      if ('email' in req) {
        email = req.email;
      }
      if ('password' in req) {
        password = req.password;
      }
      if ('callbackUrl' in req) {
        callbackUrl = req.callbackUrl ? req.callbackUrl : null;
      }
    }

    // get verification token
    const data = await _requester.post<{ url: string }>(
      req,
      `${this.resetPasswordUrl}?json=true`,
      {
        method: 'post',
        body: JSON.stringify({
          email,
          password,
          redirectUrl: this.resetPasswordUrl,
          callbackUrl,
        }),
        ..._init,
      }
    );
    const { url: urlWithParams } = data;
    const worthyParams = new URL(urlWithParams).searchParams;
    const answer = await _requester.get<Response>(
      req,
      `${this.resetPasswordUrl}?${worthyParams}`,
      _init,
      true
    );

    const token = getResetToken(answer.headers);

    const cookie = headers.get('cookie')?.split('; ');
    if (token) {
      const callback = getCallbackUrl(headers);
      if (callback) {
        cookie?.push(
          `${
            callback.startsWith('https://') ? '__Secure-' : ''
          }nile.reset=${encodeURIComponent(token)}`
        );
      }
    }
    if (cookie) {
      headers.set('cookie', cookie.join('; '));
    }
    const res = await _requester.put<Response>(req, this.resetPasswordUrl, {
      ..._init,
      headers,
    });
    const newCookie = [
      getCallbackUrl(headers),
      getCsrfToken(headers),
      getSessionToken(res.headers),
    ];
    const refreshedHeaders = new Headers({ cookie: newCookie.join(';') });

    this.resetHeaders && this.resetHeaders(refreshedHeaders);

    return res as T;
  };
}
function getSessionToken(headers: Headers | void): string | void {
  if (headers) {
    const cookies = getCookies(headers);
    if (cookies) {
      return (
        cookies['__Secure-nile.session-token'] || cookies['nile.session-token']
      );
    }
  }
}

function getCallbackUrl(headers: Headers | void): string | void {
  if (headers) {
    const cookies = getCookies(headers);
    if (cookies) {
      return (
        cookies['__Secure-nile.callback-url'] || cookies['nile.callback-url']
      );
    }
  }
}

function getCsrfToken(headers: Headers | void): string | void {
  if (headers) {
    const cookies = getCookies(headers);
    if (cookies) {
      return cookies['__Secure-nile.csrf-token'] || cookies['nile.csrf-token'];
    }
  }
}
function getResetToken(headers: Headers | void): string | void {
  if (headers) {
    const cookies = getCookies(headers);
    if (cookies) {
      return cookies['__Secure-nile.reset'] || cookies['nile.reset'];
    }
  }
}

const getCookies = (headers: Headers | void) => {
  if (!headers) return {};

  // this needs fixed, one does commas, so remove that one
  const cookieHeader = headers.get('cookie') || headers.get('set-cookie');

  if (!cookieHeader) return {};

  // Split by comma only if multiple Set-Cookie headers are merged into one
  return Object.fromEntries(
    cookieHeader.split(';').flatMap((cookie) => {
      const validCookie = cookie.split('; ')[0].split('=').length === 2;
      if (validCookie) {
        return [
          cookie
            .split('; ')[0]
            .split('=')
            .map((s) => decodeURIComponent(s.trim())),
        ];
      }
      return [];
    })
  );
};
