import { fetchMe } from '../api/routes/me';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import { fetchVerifyEmail } from '../api/routes/auth/verify-email';
import getCsrf from '../auth/obtainCsrf';
import { Loggable } from '../utils/Logger';
import { parseCallback } from '../auth';

import { User } from './types';

export default class Users {
  #config: Config;
  #logger: Loggable;
  constructor(config: Config) {
    this.#config = config;
    this.#logger = config.logger('[me]');
  }

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

  async removeSelf(): Promise<Response> {
    const me = await this.getSelf();
    if ('id' in me) {
      this.#config.userId = (me as unknown as User).id;
    }
    const res = await fetchMe(this.#config, 'DELETE');
    updateHeaders(new Headers());
    return res;
  }

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

    try {
      const me = await this.getSelf();
      if (me instanceof Response) {
        return me as T;
      }
      const res = await verifyEmailAddress(
        this.#config,
        me,
        String(callbackUrl)
      );
      return res as T;
    } catch {
      this.#logger?.warn(
        "Unable to verify email. The current user's email will be set to verified anyway. Be sure to configure emails for production."
      );
    }

    if (bypassEmail) {
      return this.updateSelf({ emailVerified: true }, rawResponse);
    }

    this.#logger.error(
      'Unable to verify email address. Configure your SMTP server in the console.'
    );
    return undefined as T;
  }
}

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

export function defaultCallbackUrl(config: Config) {
  let cb = null;
  const fallbackCb = parseCallback(config.headers);
  if (fallbackCb) {
    const [, value] = fallbackCb.split('=');
    cb = decodeURIComponent(value);
  }
  return { callbackUrl: cb };
}
