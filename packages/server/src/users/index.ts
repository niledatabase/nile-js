import { fetchMe } from '../api/routes/me';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import { fetchVerifyEmail } from '../api/routes/auth/verify-email';
import getCsrf from '../auth/obtainCsrf';
import { Loggable } from '../utils/Logger';
import { parseCallback } from '../auth';

import { User } from './types';

/**
 * Convenience wrapper around the user endpoints.
 *
 * Requests are issued via {@link fetchMe} against `/api/me`. The Swagger
 * definitions for these APIs live in
 * `packages/server/src/api/routes/me/index.ts`.
 */
export default class Users {
  #config: Config;
  #logger: Loggable;
  /**
   * Create a new Users helper.
   * @param config - The configuration used for requests.
   */
  constructor(config: Config) {
    this.#config = config;
    this.#logger = config.logger('[me]');
  }

  /**
   * Update the current user via `PUT /api/me`.
   *
   * The OpenAPI description for this endpoint can be found in
   * `packages/server/src/api/routes/me/index.ts` under `updateSelf`.
   *
   * @param req - Partial user fields to send.
   * @param [rawResponse] - When `true`, return the raw {@link Response}.
   */
  async updateSelf<T = User[] | Response>(
    req: Partial<
      Omit<
        User,
        'email' | 'tenants' | 'created' | 'updated' | 'emailVerified'
      > & { emailVerified: boolean }
    >,
    rawResponse?: boolean
  ): Promise<T> {
    const res = await fetchMe(this.#config, 'PUT', JSON.stringify(req));
    if (rawResponse) {
      return res as T;
    }
    try {
      return await res?.clone().json();
    } catch {
      return res as T;
    }
  }

  /**
   * Remove the current user using `DELETE /api/me`.
   *
   * After the request the authentication headers are cleared with
   * {@link updateHeaders}. The OpenAPI docs for this route are in
   * `packages/server/src/api/routes/me/index.ts` under `removeSelf`.
   */
  async removeSelf(): Promise<Response> {
    const me = await this.getSelf();
    if ('id' in me) {
      this.#config.userId = (me as unknown as User).id;
    }
    const res = await fetchMe(this.#config, 'DELETE');
    updateHeaders(new Headers());
    return res;
  }

  /**
   * Retrieve the current user with `GET /api/me`.
   *
   * OpenAPI for this endpoint resides in
   * `packages/server/src/api/routes/me/index.ts` (`getSelf`).
   *
   * @param [rawResponse] - When `true` return the raw {@link Response}.
   */
  async getSelf<T = User | Response>(rawResponse?: false): Promise<T>;
  async getSelf(rawResponse: true): Promise<Response>;
  async getSelf<T = User | Response>(rawResponse?: boolean): Promise<T> {
    const res = await fetchMe(this.#config);

    if (rawResponse) {
      return res as T;
    }
    try {
      return await res?.clone().json();
    } catch {
      return res as T;
    }
  }

  /**
   * Initiate an email verification flow.
   *
   * The current user is fetched and then `/auth/verify-email` is called.
   * In development or when `bypassEmail` is set, the user's
   * `emailVerified` field is updated instead of sending an email.
   * See `packages/server/src/api/routes/auth/verify-email.ts` for the
   * underlying request.
   *
   * @param [options] - Flags controlling bypass behaviour and callback URL.
   * @param [rawResponse] - When `true` return the raw {@link Response}.
   */
  async verifySelf<T = void>(): Promise<T>;
  async verifySelf(rawResponse: true): Promise<Response>;
  async verifySelf<T = Response | User>(
    options: {
      bypassEmail?: boolean;
      callbackUrl?: string;
    },
    rawResponse?: true
  ): Promise<T>;
  async verifySelf<T = void | Response>(
    options?: true | { bypassEmail?: boolean; callbackUrl?: string },
    rawResponse = false
  ): Promise<T> {
    const bypassEmail =
      typeof options === 'object' && options?.bypassEmail === true;
    const callbackUrl =
      typeof options === 'object'
        ? options.callbackUrl
        : defaultCallbackUrl(this.#config).callbackUrl;

    let res;

    try {
      const me = await this.getSelf();
      if (me instanceof Response) {
        return me as T;
      }
      res = await verifyEmailAddress(this.#config, me, String(callbackUrl));
      return res as T;
    } catch (e) {
      if (!bypassEmail) {
        let message = 'Unable to verify email.';
        if (e instanceof Error) {
          message = e.message;
        }
        this.#logger?.error(
          `${message} you can bypass this message by setting bypassEmail: true when calling 'verifySelf'`
        );
        res = new Response(message, { status: 400 });
      }
    }

    if (bypassEmail) {
      this.#logger?.info('bypassing email requirements for email verification');
      res = this.updateSelf({ emailVerified: true }, rawResponse);
    }

    return res as T;
  }
}

/**
 * Issue a POST to `/auth/verify-email` for the supplied user.
 *
 * @internal This helper is shared by {@link verifySelf}.
 * @param config - Active configuration.
 * @param user - The user to verify.
 * @param callback - Callback URL to include in the request body.
 */
async function verifyEmailAddress(
  config: Config,
  user: User,
  callback: string
) {
  config.headers.set('content-type', 'application/x-www-form-urlencoded');
  const { csrfToken } = await getCsrf<{ csrfToken: string }>(config);
  const defaults = defaultCallbackUrl(config);
  const callbackUrl = callback ?? String(defaults.callbackUrl);
  const res = await fetchVerifyEmail(
    config,
    'POST',
    new URLSearchParams({
      csrfToken,
      email: user.email,
      callbackUrl,
    }).toString()
  );
  if (res.status > 299) {
    throw new Error(await res.text());
  }
  return res;
}

/**
 * Derive the `callbackUrl` from the `nile.callback-url` cookie if present.
 *
 * @param config - Configuration whose headers may contain the cookie.
 * @returns An object with the parsed `callbackUrl` or `null`.
 */
export function defaultCallbackUrl(config: Config) {
  let cb = null;
  const fallbackCb = parseCallback(config.headers);
  if (fallbackCb) {
    const [, value] = fallbackCb.split('=');
    cb = decodeURIComponent(value);
  }
  return { callbackUrl: cb };
}
