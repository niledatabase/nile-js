import { fetchCallback } from '../api/routes/auth/callback';
import { fetchCsrf } from '../api/routes/auth/csrf';
import { fetchProviders } from '../api/routes/auth/providers';
import { fetchSession } from '../api/routes/auth/session';
import { fetchSignOut } from '../api/routes/auth/signout';
import { fetchSignUp } from '../api/routes/signup';
import { ActiveSession, JWT, Provider } from '../api/utils/auth';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import Logger, { LogReturn } from '../utils/Logger';

export default class Auth extends Config {
  logger: LogReturn;
  constructor(config: Config) {
    super(config);
    this.logger = Logger(config, '[auth]');
  }

  getSession(rawResponse: true): Promise<Response>;
  getSession<T = JWT | ActiveSession | undefined>(
    rawResponse?: false
  ): Promise<T>;
  async getSession<T = JWT | ActiveSession | Response | undefined>(
    rawResponse = false
  ): Promise<T | Response> {
    const res = await fetchSession(this);
    if (rawResponse) {
      return res;
    }
    try {
      const session = await res.json();
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
    const res = await fetchCsrf(this);
    // we're gonna use it, so set the headers now.
    const csrfCook = parseCSRF(res.headers);
    if (csrfCook) {
      // for csrf, preserve the existing cookies
      const existingCookie = this.headers.get('cookie');
      const cookieParts = [];
      if (existingCookie) {
        cookieParts.push(parseToken(this.headers), parseCallback(this.headers));
      }
      cookieParts.push(csrfCook);
      const cookie = cookieParts.filter(Boolean).join('; ');

      // we need to do it in both places in case its the very first time
      this.headers.set('cookie', cookie);
      updateHeaders(new Headers({ cookie }));
    }

    if (rawResponse) {
      return res;
    }

    try {
      return (await res.json()) as T;
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
    const res = await fetchProviders(this);
    if (rawResponse) {
      return res;
    }
    try {
      return (await res.json()) as T;
    } catch {
      return res;
    }
  }

  async signOut(rawResponse: true): Promise<Response>;
  async signOut<T = Response | { url: string }>(
    rawResponse?: false
  ): Promise<T>;
  async signOut<T = Response | { url: string }>(
    rawResponse = false
  ): Promise<T | Response> {
    // check for csrf header, maybe its already there?
    const csrfRes = await this.getCsrf();
    if (!('csrfToken' in csrfRes)) {
      throw new Error('Unable to obtain CSRF token. Sign out failed.');
    }

    const body = JSON.stringify({
      csrfToken: csrfRes.csrfToken,
      json: true,
    });
    const res = await fetchSignOut(this, body);

    updateHeaders(new Headers({}));

    if (rawResponse) {
      return res;
    }

    try {
      return (await res.json()) as T;
    } catch (e) {
      return res;
    }
  }

  async signUp(payload: { email: string; password: string }) {
    const { email, password } = payload;
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

    const res = await fetchSignUp(this, 'credentials', body);
    if (res.status > 299) {
      this.logger.error(await res.text());
      return;
    }
    const token = parseToken(res.headers);
    if (!token) {
      throw new Error('Server side sign up failed. Session token not found');
    }
    this.headers?.append('cookie', token);
    updateHeaders(this.headers);
  }

  async signIn(
    payload: { email: string; password: string },
    config?: { returnResponse?: boolean }
  ): Promise<undefined | [Headers | undefined, Response]> {
    const { info, error } = this.logger;
    const { email, password } = payload;
    if (!email || !password) {
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

    info(`Attempting sign in with email ${email}`);
    const body = JSON.stringify({
      email,
      password,
      csrfToken,
      callbackUrl: credentials.callbackUrl,
    });

    const signInRes = await fetchCallback(this, 'credentials', body);

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
        return undefined;
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
        parseCSRF(this.headers),
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

    if (config?.returnResponse) {
      return [this.headers, signInRes];
    }

    return undefined;
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
