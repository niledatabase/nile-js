import { fetchCallback } from '../api/routes/auth/callback';
import { fetchResetPassword } from '../api/routes/auth/password-reset';
import { fetchProviders } from '../api/routes/auth/providers';
import { fetchSession } from '../api/routes/auth/session';
import { fetchSignIn } from '../api/routes/auth/signin';
import { fetchSignOut } from '../api/routes/auth/signout';
import { fetchSignUp } from '../api/routes/signup';
import { ActiveSession, JWT, Provider, ProviderName } from '../api/utils/auth';
import { NileAuthRoutes } from '../api/utils/routes';
import { User } from '../users/types';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import Logger, { LogReturn } from '../utils/Logger';

import getCsrf from './getCsrf';

type SignUpPayload = {
  email: string;
  password: string;
  tenantId?: string;
  newTenantName?: string;
};
export default class Auth {
  #logger: LogReturn;
  #config: Config;
  constructor(config: Config) {
    this.#config = config;
    this.#logger = Logger(config, '[auth]');
  }

  getSession<T = JWT | ActiveSession | undefined>(
    rawResponse?: false
  ): Promise<T>;
  getSession(rawResponse: true): Promise<Response>;
  async getSession<T = JWT | ActiveSession | Response | undefined>(
    rawResponse = false
  ): Promise<T | Response> {
    const res = await fetchSession(this.#config);
    if (rawResponse) {
      return res;
    }
    try {
      const session = await res.clone().json();
      if (Object.keys(session).length === 0) {
        return undefined as T;
      }
      return session as T;
    } catch {
      return res;
    }
  }

  async getCsrf<T = Response | JSON>(rawResponse?: false): Promise<T>;
  async getCsrf(rawResponse: true): Promise<Response>;
  async getCsrf<T = Response | JSON>(rawResponse = false) {
    return await getCsrf<T>(this.#config, rawResponse);
  }

  async listProviders(rawResponse: true): Promise<Response>;
  async listProviders<T = { [key: string]: Provider }>(
    rawResponse?: false
  ): Promise<T>;
  async listProviders<T = { [key: string]: Provider }>(
    rawResponse = false
  ): Promise<T | Response> {
    const res = await fetchProviders(this.#config);
    if (rawResponse) {
      return res;
    }
    try {
      return (await res.clone().json()) as T;
    } catch {
      return res;
    }
  }

  async signOut(): Promise<Response> {
    // check for csrf header, maybe its already there?
    const csrfRes = await this.getCsrf();
    if (!('csrfToken' in csrfRes)) {
      throw new Error('Unable to obtain CSRF token. Sign out failed.');
    }

    const body = JSON.stringify({
      csrfToken: csrfRes.csrfToken,
      json: true,
    });
    const res = await fetchSignOut(this.#config, body);

    updateHeaders(new Headers({}));
    this.#config.headers = new Headers();

    return res;
  }

  /**
   * signUp only works with email + password
   * @param payload
   * @param rawResponse
   */
  async signUp(payload: SignUpPayload, rawResponse: true): Promise<Response>;
  async signUp<T = User | Response>(payload: SignUpPayload): Promise<T>;
  async signUp<T = User | Response | undefined>(
    payload: SignUpPayload,
    rawResponse?: boolean
  ): Promise<T> {
    // be sure its fresh
    this.#config.headers = new Headers();
    const { email, password, ...params } = payload;
    if (!email || !password) {
      throw new Error(
        'Server side sign up requires a user email and password.'
      );
    }

    const providers = await this.listProviders();
    const { credentials } = providers ?? {};
    if (!credentials) {
      throw new Error(
        'Unable to obtain credential provider. Aborting server side sign up.'
      );
    }

    const csrf = await this.getCsrf();

    let csrfToken;
    if ('csrfToken' in csrf) {
      csrfToken = csrf.csrfToken;
    } else {
      throw new Error('Unable to obtain parse CSRF. Request blocked.');
    }

    const body = JSON.stringify({
      email,
      password,
      csrfToken,
      callbackUrl: credentials.callbackUrl,
    });

    const res = await fetchSignUp(this.#config, { body, params });
    if (res.status > 299) {
      this.#logger.error(await res.clone().text());
      return undefined as T;
    }
    const token = parseToken(res.headers);
    if (!token) {
      throw new Error('Server side sign up failed. Session token not found');
    }
    this.#config.headers?.append('cookie', token);
    updateHeaders(this.#config.headers);
    if (rawResponse) {
      return res as T;
    }
    try {
      return (await res.clone().json()) as T;
    } catch {
      return res as T;
    }
  }

  async forgotPassword(req: {
    email: string;
    callbackUrl?: string;
    redirectUrl?: string;
  }): Promise<Response> {
    let email = '';
    const defaults = defaultCallbackUrl({
      config: this.#config,
    });
    let callbackUrl = defaults.callbackUrl;
    let redirectUrl = defaults.redirectUrl;

    if ('email' in req) {
      email = req.email;
    }

    if ('callbackUrl' in req) {
      callbackUrl = req.callbackUrl ? req.callbackUrl : null;
    }
    if ('redirectUrl' in req) {
      redirectUrl = req.redirectUrl ? req.redirectUrl : null;
    }
    const body = JSON.stringify({
      email,
      redirectUrl,
      callbackUrl,
    });

    // we need a default
    const data = await fetchResetPassword(
      this.#config,
      'POST',
      body,
      new URLSearchParams(),
      false
    );
    return data;
  }

  async resetPassword(
    req:
      | Request
      | {
          email: string;
          password: string;
          callbackUrl?: string;
          redirectUrl?: string;
        }
  ): Promise<Response> {
    let email = '';
    let password = '';
    const defaults = defaultCallbackUrl({ config: this.#config });
    let callbackUrl = defaults.callbackUrl;
    let redirectUrl = defaults.redirectUrl;
    if (req instanceof Request) {
      const body = await req.json();
      email = body.email;
      password = body.password;
      const cbFromHeaders = parseCallback(req.headers);
      if (cbFromHeaders) {
        callbackUrl = cbFromHeaders;
      }
      if (body.callbackUrl) {
        callbackUrl = body.callbackUrl;
      }
      if (body.redirectUrl) {
        redirectUrl = body.redirectUrl;
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
      if ('redirectUrl' in req) {
        redirectUrl = req.redirectUrl ? req.redirectUrl : null;
      }
    }
    // we need a default
    await this.getCsrf();
    const body = JSON.stringify({
      email,
      password,
      redirectUrl,
      callbackUrl,
    });
    let urlWithParams;
    try {
      const data = await fetchResetPassword(this.#config, 'POST', body);
      const cloned = data.clone();
      if (data.status === 400) {
        const text = await cloned.text();
        this.#logger.error(text);
        return data;
      }

      const { url } = await data.json();
      urlWithParams = url;
    } catch {
      // failed
    }
    let token;
    try {
      const worthyParams = new URL(urlWithParams).searchParams;
      const answer = await fetchResetPassword(
        this.#config,
        'GET',
        null,
        worthyParams
      );
      token = parseResetToken(answer.headers);
    } catch {
      this.#logger.warn(
        'Unable to parse reset password url. Password not reset.'
      );
    }

    // this only needs to happen on the local config
    const cookie = this.#config.headers.get('cookie')?.split('; ');
    if (token) {
      cookie?.push(token);
    } else {
      throw new Error(
        'Unable to reset password, reset token is missing from response'
      );
    }
    this.#config.headers = new Headers({
      ...this.#config.headers,
      cookie: cookie?.join('; '),
    });
    const res = await fetchResetPassword(this.#config, 'PUT', body);
    // remove the token
    cookie?.pop();
    const cleaned: string[] =
      cookie?.filter((c) => !c.includes('nile.session')) ?? [];
    cleaned.push(String(parseToken(res.headers)));
    const updatedHeaders = new Headers({ cookie: cleaned.join('; ') });
    updateHeaders(updatedHeaders);

    return res;
  }
  async callback(provider: ProviderName, body?: string | Request) {
    if (body instanceof Request) {
      this.#config.headers = body.headers;
      return await fetchCallback(
        this.#config,
        provider,
        undefined,
        body,
        'GET'
      );
    }
    return await fetchCallback(this.#config, provider, body);
  }
  /**
   * The return value from this will be a redirect for the client
   * In most cases, you should forward the response directly to the client
   * @param payload
   * @param rawResponse
   */
  async signIn<T = Response>(
    provider: ProviderName,
    payload?: Request | { email: string; password: string },
    rawResponse?: true
  ): Promise<T>;
  async signIn<T = Response | undefined>(
    provider: ProviderName,
    payload?: Request | { email: string; password: string },
    rawResponse?: boolean
  ): Promise<T> {
    if (payload instanceof Request) {
      const body = new URLSearchParams(await payload.text());
      const origin = new URL(payload.url).origin;

      const payloadUrl = body?.get('callbackUrl');
      const csrfToken = body?.get('csrfToken');

      const callbackUrl = `${
        !payloadUrl?.startsWith('http') ? origin : ''
      }${payloadUrl}`;
      if (!csrfToken) {
        throw new Error(
          'CSRF token in missing from request. Request it by the client before calling sign in'
        );
      }
      this.#config.headers = new Headers(payload.headers);

      this.#config.headers.set(
        'Content-Type',
        'application/x-www-form-urlencoded'
      );
      const params = new URLSearchParams({
        csrfToken,
        json: String(true),
      });
      if (payloadUrl) {
        params.set('callbackUrl', callbackUrl);
      }
      return (await fetchSignIn(this.#config, provider, params)) as T;
    }

    this.#config.headers = new Headers();
    const { info, error } = this.#logger;

    const providers = await this.listProviders();
    info('Obtaining csrf');
    const csrf = await this.getCsrf();

    let csrfToken;
    if ('csrfToken' in csrf) {
      csrfToken = csrf.csrfToken;
    } else {
      throw new Error('Unable to obtain parse CSRF. Request blocked.');
    }

    const { credentials } = providers ?? {};

    if (!credentials) {
      throw new Error(
        'Unable to obtain credential provider. Aborting server side sign in.'
      );
    }

    const { email, password } = payload ?? {};
    if (provider === 'email' && (!email || !password)) {
      throw new Error(
        'Server side sign in requires a user email and password.'
      );
    }

    info(`Obtaining providers for ${email}`);
    info(`Attempting sign in with email ${email}`);
    const body = JSON.stringify({
      email,
      password,
      csrfToken,
      callbackUrl: credentials.callbackUrl,
    });

    const signInRes = await this.callback(provider, body);

    const authCookie = signInRes?.headers.get('set-cookie');
    if (!authCookie) {
      throw new Error('authentication failed');
    }

    const token = parseToken(signInRes?.headers);
    const possibleError = signInRes?.headers.get('location');
    if (possibleError) {
      let urlError;
      try {
        urlError = new URL(possibleError).searchParams.get('error');
      } catch {
        //noop
      }
      if (urlError) {
        error('Unable to log user in', { error: urlError });
        return undefined as T;
      }
    }
    if (!token) {
      error('Unable to obtain auth token', {
        authCookie,
        signInRes,
      });
      throw new Error('Server login failed');
    }
    info('Server sign in successful', { authCookie });

    // last thing to do is be sure the next call is up to date with good headers
    const setCookie = signInRes.headers.get('set-cookie');
    if (setCookie) {
      const cookie = [
        parseCSRF(this.#config.headers),
        parseCallback(signInRes.headers),
        parseToken(signInRes.headers),
      ]
        .filter(Boolean)
        .join('; ');
      updateHeaders(new Headers({ cookie }));
    } else {
      error('Unable to set context after sign in', {
        headers: signInRes.headers,
      });
    }

    if (rawResponse) {
      return signInRes as T;
    }
    try {
      return (await signInRes.clone().json()) as T;
    } catch {
      return signInRes as T;
    }
  }
}

export function parseCSRF(headers?: Headers) {
  let cookie = headers?.get('set-cookie');
  if (!cookie) {
    cookie = headers?.get('cookie');
  }
  if (!cookie) {
    return undefined;
  }
  const [, token] = /((__Secure-)?nile\.csrf-token=[^;]+)/.exec(cookie) ?? [];
  return token;
}

export function parseCallback(headers?: Headers) {
  let cookie = headers?.get('set-cookie');
  if (!cookie) {
    cookie = headers?.get('cookie');
  }
  if (!cookie) {
    return undefined;
  }
  const [, token] = /((__Secure-)?nile\.callback-url=[^;]+)/.exec(cookie) ?? [];
  return token;
}

export function parseToken(headers?: Headers) {
  let authCookie = headers?.get('set-cookie');
  if (!authCookie) {
    authCookie = headers?.get('cookie');
  }
  if (!authCookie) {
    return undefined;
  }
  const [, token] =
    /((__Secure-)?nile\.session-token=[^;]+)/.exec(authCookie) ?? [];
  return token;
}
function parseResetToken(headers: Headers | void): string | void {
  let authCookie = headers?.get('set-cookie');
  if (!authCookie) {
    authCookie = headers?.get('cookie');
  }
  if (!authCookie) {
    return undefined;
  }
  const [, token] = /((__Secure-)?nile\.reset=[^;]+)/.exec(authCookie) ?? [];
  return token;
}

function defaultCallbackUrl({ config }: { config: Config }) {
  let cb = null;
  let redirect = null;
  const fallbackCb = parseCallback(config.headers);
  if (fallbackCb) {
    const [, value] = fallbackCb.split('=');
    cb = decodeURIComponent(value);
    if (value) {
      redirect = `${new URL(cb).origin}${NileAuthRoutes.PASSWORD_RESET}`;
    }
  }
  return { callbackUrl: cb, redirectUrl: redirect };
}
