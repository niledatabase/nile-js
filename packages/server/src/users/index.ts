import { fetchMe } from '../api/routes/me';
import { Config } from '../utils/Config';
import { updateHeaders } from '../utils/Event';

import { User } from './types';

export default class Users {
  #config: Config;
  constructor(config: Config) {
    this.#config = config;
  }

  async updateSelf<T = User[] | Response>(
    req: Partial<Omit<User, 'email' | 'tenants' | 'created' | 'updated'>>,
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
}
