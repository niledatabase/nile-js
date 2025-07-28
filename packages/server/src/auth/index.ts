import { fetchCallback } from '../api/routes/auth/callback';
import { fetchResetPassword } from '../api/routes/auth/password-reset';
import { fetchProviders } from '../api/routes/auth/providers';
import { fetchSession } from '../api/routes/auth/session';
import { fetchSignIn } from '../api/routes/auth/signin';
import { fetchSignOut } from '../api/routes/auth/signout';
import { fetchSignUp } from '../api/routes/signup';
import { ActiveSession, JWT, Provider, ProviderName } from '../api/utils/auth';
import { ctx, withNileContext } from '../api/utils/request-context';
import { NileAuthRoutes } from '../api/utils/routes';
import { User } from '../users/types';
import { Config } from '../utils/Config';
import { updateHeaders, updateTenantId } from '../utils/Event';
import { Loggable } from '../utils/Logger';

import obtainCsrf from './obtainCsrf';

type SignUpPayload = {
  email: string;
  password: string;
  tenantId?: string;
  newTenantName?: string;
};
/**
 * Utility class that wraps the server side authentication endpoints.
 *
 * The methods in this class call the `fetch*` helpers which are generated
 * from the OpenAPI specification. Those helpers interact with routes under
 * the `/api/auth` prefix such as `/session`, `/signin`, `/signout` and others.
 * By reusing them here we provide a higher level interface for frameworks to
 * manage user authentication.
 */
export default class Auth {
  #logger: Loggable;
  #config: Config;
  /**
   * Create an Auth helper.
   *
   * @param config - runtime configuration used by the underlying fetch helpers
   *   such as `serverOrigin`, `routePrefix` and default headers.
   */
  constructor(config: Config) {
    this.#config = config;
    this.#logger = config.logger('[auth]');
  }
  /**
   * Retrieve the currently active session from the API.
   *
   * Internally this issues a `GET` request to `/api/auth/session` via
   * {@link fetchSession}. If `rawResponse` is `true` the raw {@link Response}
   * object is returned instead of the parsed JSON.
   *
   * @template T Return type for the parsed session.
   * @param rawResponse - set to `true` to get the raw {@link Response} object.
   */
  getSession<T = JWT | ActiveSession | undefined>(
    rawResponse?: false
  ): Promise<T>;
  getSession(rawResponse: true): Promise<Response>;
  async getSession<T = JWT | ActiveSession | Response | undefined>(
    rawResponse = false
  ): Promise<T | Response> {
    return withNileContext(this.#config, async () => {
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
    });
  }
  /**
   * Acquire a CSRF token for subsequent authenticated requests.
   *
   * Issues a `GET` to `/api/auth/csrf` via {@link obtainCsrf}. When the call
   * succeeds the returned headers are merged into the current configuration so
   * future requests include the appropriate cookies.
   *
   * @param rawResponse - when `true`, skip JSON parsing and return the raw
   *   {@link Response}.
   */
  async getCsrf<T = Response | JSON>(rawResponse?: false): Promise<T>;
  async getCsrf(rawResponse: true): Promise<Response>;
  async getCsrf<T = Response | JSON>(rawResponse = false) {
    return withNileContext(this.#config, async () => {
      return await obtainCsrf<T>(this.#config, rawResponse);
    });
  }
  /**
   * List all configured authentication providers.
   *
   * This calls `/api/auth/providers` using {@link fetchProviders} to retrieve
   * the available provider configuration. Providers are returned as an object
   * keyed by provider name.
   *
   * @param rawResponse - when true, return the {@link Response} instead of the
   *   parsed JSON.
   */
  async listProviders(rawResponse: true): Promise<Response>;
  async listProviders<T = { [key: string]: Provider }>(
    rawResponse?: false
  ): Promise<T>;
  async listProviders<T = { [key: string]: Provider }>(
    rawResponse = false
  ): Promise<T | Response> {
    return withNileContext(this.#config, async () => {
      const res = await fetchProviders(this.#config);
      if (rawResponse) {
        return res;
      }
      try {
        return (await res.clone().json()) as T;
      } catch {
        return res;
      }
    });
  }
  /**
   * Sign the current user out by calling `/api/auth/signout`.
   *
   * The CSRF token is fetched automatically and the stored cookies are cleared
   * from the internal configuration once the request completes.
   */
  async signOut(): Promise<Response> {
    return withNileContext(this.#config, async () => {
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
      ctx.set({ headers: null });

      return res;
    });
  }

  /**
   * Create a new user account and start a session.
   *
   * This method posts to the `/api/signup` endpoint using
   * {@link fetchSignUp}. Only the credential provider is supported; a valid
   * email and password must be supplied. On success the returned session token
   * is stored in the headers used for subsequent requests.
   *
   * @param payload - email and password along with optional tenant
   *   information.
   * @param rawResponse - when `true` return the raw {@link Response} rather
   *   than the parsed {@link User} object.
   */
  async signUp(payload: SignUpPayload, rawResponse: true): Promise<Response>;
  async signUp<T = User | Response>(payload: SignUpPayload): Promise<T>;
  async signUp<T = User | Response | undefined>(
    payload: SignUpPayload,
    rawResponse?: boolean
  ): Promise<T> {
    return withNileContext(this.#config, async () => {
      // be sure its fresh
      ctx.set({ headers: null });
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

      const csrf = await obtainCsrf(this.#config);

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
      const { headers } = ctx.get();
      headers?.append('cookie', token);
      ctx.set({ headers });
      // this will globally set headers for everyone, so how
      // do you make it so you can chain these together? or at least
      // call them sequentially safely? you gotta use the `withContext` callback
      updateHeaders(headers);
      if (rawResponse) {
        return res as T;
      }
      try {
        const json = (await res.clone().json()) as T;
        if (json && typeof json === 'object' && 'tenants' in json) {
          const tenantId = (json as unknown as User).tenants[0];
          if (tenantId) {
            updateTenantId(tenantId);
          }
        }
        return json;
      } catch {
        return res as T;
      }
    });
  }

  /**
   * Request a password reset email.
   *
   * Sends a `POST` to `/api/auth/password-reset` with the provided email and
   * optional callback information. The endpoint responds with a redirect URL
   * which is returned as a {@link Response} object.
   */
  async forgotPassword(req: {
    email: string;
    callbackUrl?: string;
    redirectUrl?: string;
  }): Promise<Response> {
    return withNileContext(this.#config, async () => {
      let email = '';
      const defaults = defaultCallbackUrl(this.#config);
      let callbackUrl = defaults.callbackUrl;
      let redirectUrl = defaults.redirectUrl;

      if ('email' in req) {
        email = req.email;
      }

      if ('callbackUrl' in req) {
        callbackUrl = fQUrl(req.callbackUrl ?? '', this.#config);
      }
      if ('redirectUrl' in req) {
        redirectUrl = fQUrl(req.redirectUrl ?? '', this.#config);
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
    });
  }

  /**
   * Complete a password reset.
   *
   * This workflow expects a token obtained from {@link forgotPassword}. The
   * function performs a POST/GET/PUT sequence against
   * `/api/auth/password-reset` as described in the OpenAPI specification.
   *
   * @param req - either a {@link Request} with a JSON body or an object
   *   containing the necessary fields.
   */
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
    return withNileContext(this.#config, async () => {
      let email = '';
      let password = '';
      const defaults = defaultCallbackUrl(this.#config);
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
      const { headers } = ctx.get();
      const cookie = headers?.get('cookie')?.split('; ');
      if (token) {
        cookie?.push(token);
      } else {
        throw new Error(
          'Unable to reset password, reset token is missing from response'
        );
      }
      if (cookie) {
        headers?.set('cookie', cookie?.join('; '));
        ctx.set({
          headers,
        });
      }
      const res = await fetchResetPassword(this.#config, 'PUT', body);
      // remove the token
      cookie?.pop();
      const cleaned: string[] =
        cookie?.filter((c) => !c.includes('nile.session')) ?? [];
      cleaned.push(String(parseToken(res.headers)));
      const updatedHeaders = new Headers({ cookie: cleaned.join('; ') });
      updateHeaders(updatedHeaders);

      return res;
    });
  }
  /**
   * Low level helper used by {@link signIn} to complete provider flows.
   *
   * Depending on the provider this issues either a GET or POST request to
   * `/api/auth/callback/{provider}` via {@link fetchCallback}.
   */
  async callback(provider: ProviderName, body?: string | Request) {
    if (body instanceof Request) {
      ctx.set({
        headers: body.headers,
      });
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
   * Sign a user in with one of the configured providers.
   *
   * Internally this posts to `/api/auth/signin/{provider}` and follows the
   * provider callback flow as documented in the OpenAPI spec. When using the
   * credential provider an email and password must be supplied.
   *
   * @param payload - request body or credential object
   * @param rawResponse - return the raw {@link Response} instead of parsed JSON
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
    return withNileContext(this.#config, async () => {
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

        const updatedHeaders = new Headers(payload.headers);
        updatedHeaders.set('Content-Type', 'application/x-www-form-urlencoded');

        ctx.set({ headers: updatedHeaders });

        const params = new URLSearchParams({
          csrfToken,
          json: String(true),
        });
        if (payloadUrl) {
          params.set('callbackUrl', callbackUrl);
        }
        return (await fetchSignIn(this.#config, provider, params)) as T;
      }

      ctx.set({ headers: null });

      const { info, error } = this.#logger;

      const providers = await this.listProviders();
      info('Obtaining csrf');
      const csrf = await obtainCsrf(this.#config);

      let csrfToken;
      if ('csrfToken' in csrf) {
        csrfToken = csrf.csrfToken;
        // const parsedCookie = csrf.headers.get('cookie');
        // if (parsedCookie) {
        // this.#config.context.headers.set('cookie', parsedCookie);
        // }
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
      if (!email) {
        throw new Error('Email missing from payload, unable to sign in');
      }
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
          return new Response(urlError, { status: signInRes.status }) as T;
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
      const { headers } = ctx.get();
      if (setCookie) {
        const cookie = [
          parseCSRF(headers),
          parseCallback(signInRes.headers),
          parseToken(signInRes.headers),
        ]
          .filter(Boolean)
          .join('; ');
        const uHeaders = new Headers({ cookie });
        updateHeaders(uHeaders);
        ctx.set({ headers: uHeaders, preserveHeaders: true });
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
    });
  }
}

/**
 * Extract the CSRF cookie from a set of headers.
 */
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

/**
 * Extract the callback cookie from a set of headers.
 */
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

/**
 * Extract the session token cookie from a set of headers.
 */
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
/**
 * Internal helper for the password reset flow.
 */
export function parseResetToken(headers: Headers | void): string | void {
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

/**
 * Extract the tenantId cookie from a set of headers.
 */
export function parseTenantId(headers?: Headers) {
  let authCookie = headers?.get('set-cookie');
  if (!authCookie) {
    authCookie = headers?.get('cookie');
  }
  if (!authCookie) {
    return undefined;
  }
  const [, token] =
    /((__Secure-)?nile\.tenant-id=[^;]+)/.exec(authCookie) ?? [];
  if (token) {
    const [, tenantId] = token.split('=');
    return tenantId;
  }
  return null;
}

/**
 * Determine the default callback and redirect URLs from the configured
 * headers. These are used during password reset flows when no explicit
 * callback is provided.
 */
export function defaultCallbackUrl(config: Config) {
  let cb = null;
  let redirect = null;
  const { headers } = ctx.get();
  const fallbackCb = parseCallback(headers);
  if (fallbackCb) {
    const [, value] = fallbackCb.split('=');
    cb = decodeURIComponent(value);
    if (value) {
      redirect = `${new URL(cb).origin}${config.routePrefix}${
        NileAuthRoutes.PASSWORD_RESET
      }`;
    }
  }
  return { callbackUrl: cb, redirectUrl: redirect };
}

function fQUrl(path: string, config: Config) {
  if (path.startsWith('/')) {
    const { callbackUrl } = defaultCallbackUrl(config);
    if (callbackUrl) {
      const { origin } = new URL(callbackUrl);
      return `${origin}${path}`;
    }
  }
  try {
    new URL(path);
  } catch {
    throw new Error('An invalid URL has been passed.');
  }
  return path;
}
