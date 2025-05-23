import { fetchMe } from '../api/routes/me';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';
import { fetchVerifyEmail } from '../api/routes/auth/verify-email';
import getCsrf from '../auth/getCsrf';
import Logger, { LogReturn } from '../utils/Logger';

import { User } from './types';

export default class Users {
  #config: Config;
  #logger: LogReturn;
  constructor(config: Config) {
    this.#config = config;
    this.#logger = Logger(config, '[me]');
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

  async getSelf(rawResponse?: true): Promise<Response>;
  async getSelf<T = User | Response>(): Promise<T>;
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

  async verifySelf(rawResponse?: true): Promise<Response>;
  async verifySelf<T = Response | void>(): Promise<T>;
  async verifySelf<T = Response | void>(
    bypassEmail = process.env.NODE_ENV !== 'production',
    rawResponse = false
  ): Promise<T> {
    try {
      const me = await this.getSelf();
      if (me instanceof Response) {
        return me as T;
      }
      const res = await verifyEmailAddress(this.#config, me);
      return res as T;
    } catch {
      this.#logger?.warn(
        "Unable to verify email. The current user's email will be set to verified any way. Be sure to configure emails for production."
      );
    }
    if (bypassEmail) {
      return await this.updateSelf({ emailVerified: true }, rawResponse);
    }
    this.#logger.error(
      'Unable to verify email address. Configure your SMTP server in the console.'
    );
    return undefined as T;
  }
}

async function verifyEmailAddress(config: Config, user: User) {
  config.headers.set('content-type', 'application/x-www-form-urlencoded');
  const { csrfToken } = await getCsrf<{ csrfToken: string }>(config);
  const res = await fetchVerifyEmail(
    config,
    'POST',
    new URLSearchParams({ csrfToken, email: user.email }).toString()
  );
  if (res.status > 299) {
    throw new Error(await res.text());
  }
  return res;
  // return await fetchVerifyEmail(config, 'GET');
}
