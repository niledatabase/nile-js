import { fetchCallback } from '../api/routes/auth/callback';
import { fetchCsrf } from '../api/routes/auth/csrf';
import { fetchProviders } from '../api/routes/auth/providers';
import { fetchSession } from '../api/routes/auth/session';
import { fetchSignIn } from '../api/routes/auth/signin';
import { fetchSignOut } from '../api/routes/auth/signout';
import { fetchSignUp } from '../api/routes/signup';
import { ActiveSession, JWT, Provider, ProviderName } from '../api/utils/auth';
import { User } from '../users/types';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import Logger, { LogReturn } from '../utils/Logger';

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

  getSession(rawResponse: true): Promise<Response>;
  getSession<T = JWT | ActiveSession | undefined>(
    rawResponse?: false
  ): Promise<T>;
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

  async getCsrf(rawResponse: true): Promise<Response>;
  async getCsrf<T = Response | JSON>(rawResponse?: false): Promise<T>;
  async getCsrf<T = Response | JSON>(rawResponse = false) {
    const res = await fetchCsrf(this.#config);
    // we're gonna use it, so set the headers now.
    const csrfCook = parseCSRF(res.headers);

    // prefer the csrf from the headers over the saved one
    if (csrfCook) {
      const [, value] = csrfCook.split('=');
      const [token] = decodeURIComponent(value).split('|');

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        const cookie = [
          csrfCook,
          parseCallback(res.headers),
          parseToken(res.headers),
        ]
          .filter(Boolean)
          .join('; ');
        this.#config.headers.set('cookie', cookie);
        updateHeaders(new Headers({ cookie }));
      }
      if (!rawResponse) {
        return { csrfToken: token };
      }
    } else {
      // for csrf, preserve the existing cookies
      const existingCookie = this.#config.headers.get('cookie');
      const cookieParts = [];
      if (existingCookie) {
        cookieParts.push(
          parseToken(this.#config.headers),
          parseCallback(this.#config.headers)
        );
      }
      cookieParts.push(csrfCook);
      const cookie = cookieParts.filter(Boolean).join('; ');

      // we need to do it in both places in case its the very first time
      this.#config.headers.set('cookie', cookie);
      updateHeaders(new Headers({ cookie }));
    }

    if (rawResponse) {
      return res;
    }

    try {
      return (await res.clone().json()) as T;
    } catch {
      return res;
    }
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

  /**
   * The return value from this will be a redirect for the client
   * In most cases, you should forward the response directly to the client
   * @param payload
   * @param rawResponse
   */
  async signIn<T = Response>(
    provider: ProviderName,
    payload?: { email: string; password: string },
    rawResponse?: true
  ): Promise<T>;
  async signIn<T = Response | undefined>(
    provider: ProviderName,
    payload?: { email: string; password: string },
    rawResponse?: boolean
  ): Promise<T> {
    this.#config.headers = new Headers();
    const { info, error } = this.#logger;
    const { email, password } = payload ?? {};
    if (provider === 'email' && (!email || !password)) {
      throw new Error(
        'Server side sign in requires a user email and password.'
      );
    }

    info(`Obtaining providers for ${email}`);
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
    if (provider !== 'credentials') {
      return (await fetchSignIn(
        this.#config,
        provider,
        JSON.stringify({ csrfToken })
      )) as T;
    }

    info(`Attempting sign in with email ${email}`);
    const body = JSON.stringify({
      email,
      password,
      csrfToken,
      callbackUrl: credentials.callbackUrl,
    });

    const signInRes = await fetchCallback(this.#config, provider, body);

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
