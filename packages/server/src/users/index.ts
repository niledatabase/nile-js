import { fetchMe } from '../api/routes/me';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import { fetchVerifyEmail } from '../api/routes/auth/verify-email';
import getCsrf from '../auth/obtainCsrf';
import { Loggable } from '../utils/Logger';
import { parseCallback } from '../auth';

import { User } from './types';

/**
 * Helper functions for interacting with the currently authenticated user.
 *
 * These helpers wrap the {@link fetchMe} utility which calls the
 * <code>/api/me</code> endpoint. The underlying route definitions contain
 * OpenAPI descriptions that document the behaviour of each request.
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
   * Update information about the authenticated user using
   * a <code>PUT</code> request to <code>/api/me</code>.
   *
   * See the <code>updateSelf</code> operation in the OpenAPI
   * specification for the full list of supported fields.
   *
   * @param req - The profile fields to update.
   * @param [rawResponse] - When <code>true</code>, the raw {@link Response}
   *   from <code>fetch</code> is returned instead of the parsed payload.
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
   * Soft delete the authenticated user via <code>DELETE /api/me</code> and
   * clear authentication headers.
   *
   * The removal only happens server side; client state is not automatically
   * cleaned up other than resetting the stored headers.
   *
   * @returns The {@link Response} from the server.
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
   * Retrieve information for the authenticated user using
   * <code>GET /api/me</code>.
   *
   * @param [rawResponse] - When <code>true</code>, returns the raw
   *   {@link Response} instead of the parsed {@link User} object.
   */
  async getSelf<T = User | Response>(): Promise<T>;
  async getSelf(rawResponse?: true): Promise<Response>;
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
   * Initiate an email verification flow for the authenticated user.
   *
   * A <code>POST</code> request is sent to <code>/auth/verify-email</code>
   * after retrieving the current user via {@link getSelf}. If the
   * <code>bypassEmail</code> flag is provided, the user's
   * <code>emailVerified</code> field is updated instead of sending an email.
   *
   * @param [options] - Optional flags controlling email delivery and the
   *   callback URL used for verification.
   * @param [rawResponse] - When <code>true</code> the raw
   *   {@link Response} is returned.
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
      typeof options === 'object'
        ? options.bypassEmail ?? process.env.NODE_ENV !== 'production'
        : process.env.NODE_ENV !== 'production';

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
    } catch {
      const message = 'Unable to verify email.';
      this.#logger?.warn(message);
      res = new Response(message, { status: 400 });
    }

    if (bypassEmail) {
      res = this.updateSelf({ emailVerified: true }, rawResponse);
    }

    this.#logger.error(
      'Unable to verify email address. Configure your SMTP server in the console.'
    );
    return res as T;
  }
}

/**
 * Send a verification email for the given user via the
 * <code>/auth/verify-email</code> endpoint.
 *
 * @internal
 * @param config - Current configuration instance.
 * @param user - User being verified.
 * @param callback - Callback URL to use for verification.
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
 * Extract a callback URL from the <code>nile.callback-url</code> cookie in the
 * provided configuration headers.
 *
 * @param config - Current configuration instance.
 * @returns Object containing the found <code>callbackUrl</code> or
 *   <code>null</code>.
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
