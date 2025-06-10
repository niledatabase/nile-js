import { fetchMe } from '../api/routes/me';
import {
  fetchTenant,
  fetchTenants,
  fetchTenantsByUser,
} from '../api/routes/tenants';
import { fetchInvite } from '../api/routes/tenants/[tenantId]/invite';
import { fetchInvites } from '../api/routes/tenants/[tenantId]/invites';
import { fetchTenantUsers } from '../api/routes/tenants/[tenantId]/users';
import { fetchTenantUser } from '../api/routes/tenants/[tenantId]/users/[userId]';
import { DefaultNileAuthRoutes } from '../api/utils/routes';
import { parseCallback } from '../auth';
import obtainCsrf from '../auth/obtainCsrf';
import { NileRequest } from '../types';
import { User } from '../users/types';
import { Config } from '../utils/Config';

import { Invite, Tenant } from './types';

type ReqContext = { userId?: string; tenantId?: string };
type JoinTenantRequest = string | ReqContext | { id: string };

export default class Tenants {
  #config: Config;
  constructor(config: Config) {
    this.#config = config;
  }

  create(name: string, rawResponse: true): Promise<Response>;
  create<T = Tenant | Response>(
    name: string,
    rawResponse?: boolean
  ): Promise<T>;
  create<T = Tenant | Response>(
    payload: {
      name: string;
      id?: string;
    },
    rawResponse?: boolean
  ): Promise<T>;
  async create<T = Tenant | Response | undefined>(
    req: { name: string; id?: string } | string,
    rawResponse?: boolean
  ): Promise<T | Response | undefined> {
    let res;
    if (typeof req === 'string') {
      res = await fetchTenants(
        this.#config,
        'POST',
        JSON.stringify({ name: req })
      );
    } else if (typeof req === 'object' && ('name' in req || 'id' in req)) {
      res = await fetchTenants(this.#config, 'POST', JSON.stringify(req));
    }
    if (rawResponse) {
      return res as T;
    }
    try {
      return await res?.clone().json();
    } catch {
      return res;
    }
  }

  delete<T = Response>(id?: string): Promise<T>;
  delete<T = Response>(payload: { id: string }): Promise<T>;
  async delete<T = Response>(
    req: NileRequest<void> | { id?: string } | string | Tenant
  ): Promise<T | Response> {
    if (typeof req === 'string') {
      this.#config.tenantId = req;
    }
    if (typeof req === 'object' && 'id' in req) {
      this.#config.tenantId = req.id;
    }
    const res = await fetchTenant(this.#config, 'DELETE');
    return res;
  }

  get<T = Tenant | Response>(): Promise<T>;
  get<T = Tenant | Response>(id: string, rawResponse?: boolean): Promise<T>;
  get(rawResponse: true): Promise<Response>;
  get<T = Tenant | Response>(
    payload: { id: string },
    rawResponse?: boolean
  ): Promise<T>;
  async get<T = Tenant | Response>(
    req: boolean | { id: string } | string | void,
    rawResponse?: boolean
  ): Promise<T> {
    if (typeof req === 'string') {
      this.#config.tenantId = req;
    } else if (typeof req === 'object' && 'id' in req) {
      this.#config.tenantId = req.id;
    }
    const res = await fetchTenant(this.#config, 'GET');
    if (rawResponse === true || req === true) {
      return res as T;
    }

    try {
      return await res?.clone().json();
    } catch {
      return res as T;
    }
  }

  async update(req: Partial<Tenant>, rawResponse: true): Promise<Response>;
  update<T = Tenant | Response | undefined>(
    req: Partial<Tenant>,
    rawResponse?: boolean
  ): Promise<T>;
  async update<T = Tenant | Response | undefined>(
    req: Partial<Tenant>,
    rawResponse?: boolean
  ): Promise<T> {
    let res;
    if (typeof req === 'object' && ('name' in req || 'id' in req)) {
      const { id, ...remaining } = req;
      if (id) {
        this.#config.tenantId = id;
      }
      res = await fetchTenant(this.#config, 'PUT', JSON.stringify(remaining));
    }
    if (rawResponse) {
      return res as T;
    }
    try {
      return await res?.clone().json();
    } catch {
      return res as T;
    }
  }

  list<T = Tenant[] | Response>(): Promise<T>;
  list(rawResponse: true): Promise<Response>;
  async list<T = Tenant[] | Response>(
    req: boolean | NileRequest<void> | Headers
  ): Promise<T | Response | undefined> {
    const res = await fetchTenantsByUser(this.#config);
    if (req === true) {
      return res;
    }

    try {
      return await res?.clone().json();
    } catch {
      return res;
    }
  }
  async leaveTenant<T = Response>(
    req?: string | { tenantId: string }
  ): Promise<T> {
    const me = await fetchMe(this.#config);
    try {
      const json = await me.json();
      if ('id' in json) {
        this.#config.userId = json.id;
      }
    } catch {
      // maybe there's already a context, let `fetchTenantUser` deal with it
    }
    if (typeof req === 'string') {
      this.#config.tenantId = req;
    } else {
      this.#handleContext(req);
    }
    return (await fetchTenantUser(this.#config, 'DELETE')) as T;
  }

  addMember(req: JoinTenantRequest, rawResponse: true): Promise<Response>;
  addMember<T = User | Response>(
    req: JoinTenantRequest,
    rawResponse?: boolean
  ): Promise<T>;
  async addMember<T = User | Response>(
    req: JoinTenantRequest,
    rawResponse?: boolean
  ): Promise<T> {
    if (typeof req === 'string') {
      this.#config.userId = req;
    } else {
      this.#handleContext(req);
    }

    const res = await fetchTenantUser(this.#config, 'PUT');
    return responseHandler(res, rawResponse);
  }

  async removeMember(
    req: JoinTenantRequest,
    rawResponse?: boolean
  ): Promise<Response> {
    this.#handleContext(req);
    const res = await fetchTenantUser(this.#config, 'DELETE');
    return responseHandler(res, rawResponse);
  }
  users<T = User[] | Response>(
    req?: boolean | { tenantId?: string },
    rawResponse?: boolean
  ): Promise<T>;
  users(req: true): Promise<Response>;
  async users<T>(
    req?: boolean | { tenantId?: string },
    rawResponse?: boolean
  ): Promise<T> {
    this.#handleContext(req);
    const res = await fetchTenantUsers(this.#config, 'GET');

    return responseHandler(
      res,
      rawResponse || (typeof req === 'boolean' && req)
    ) as T;
  }

  async invites<T = Invite[] | Response>(): Promise<T> {
    const res = await fetchInvites(this.#config);

    return responseHandler(res);
  }

  async invite<T = Response | Invite>(
    req: string | { email: string; callbackUrl?: string; redirectUrl?: string },
    rawResponse?: boolean
  ): Promise<T>;
  async invite(
    req: string | { email: string; callbackUrl?: string; redirectUrl?: string },
    rawResponse: true
  ): Promise<Response>;
  async invite<T = Response | Invite>(
    req: string | { email: string; callbackUrl?: string; redirectUrl?: string },
    rawResponse?: boolean
  ): Promise<T> {
    const { csrfToken } = await obtainCsrf<{ csrfToken: string }>(this.#config);

    const defaults = defaultCallbackUrl(this.#config);
    let identifier: string = req as string;
    let callbackUrl: string = defaults.callbackUrl as string;
    let redirectUrl: string = defaults.redirectUrl as string;

    if (typeof req === 'object') {
      if ('email' in req) {
        identifier = req.email;
      }

      if ('callbackUrl' in req) {
        callbackUrl = req.callbackUrl ? req.callbackUrl : '';
      }
      if ('redirectUrl' in req) {
        redirectUrl = req.redirectUrl ? req.redirectUrl : '';
      }
    }

    this.#config.headers.set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    const res = await fetchInvite(
      this.#config,
      'POST',
      new URLSearchParams({
        identifier,
        csrfToken,
        callbackUrl,
        redirectUrl,
      }).toString()
    );
    return responseHandler(res, rawResponse);
  }

  async acceptInvite<T = Response>(
    req?: { identifier: string; token: string; redirectUrl?: string },
    rawResponse?: boolean
  ): Promise<T> {
    if (!req) {
      throw new Error('The identifier and token are required.');
    }
    const { identifier, token } = req;
    const defaults = defaultCallbackUrl(this.#config);
    const callbackUrl = String(defaults.callbackUrl);

    const res = await fetchInvite(
      this.#config,
      'PUT',
      new URLSearchParams({
        identifier,
        token,
        callbackUrl,
      }).toString()
    );
    return responseHandler(res, rawResponse);
  }

  async deleteInvite<T = Response>(req: string | { id: string }): Promise<T> {
    let id = '';
    if (typeof req === 'object') {
      id = req.id;
    } else {
      id = req;
    }

    if (!id) {
      throw new Error('An invite id is required.');
    }

    const res = await fetchInvite(this.#config, 'DELETE', id);
    return responseHandler(res, true);
  }

  #handleContext(req: JoinTenantRequest | boolean | undefined) {
    if (typeof req === 'object') {
      if ('tenantId' in req) {
        this.#config.tenantId = req.tenantId;
      }
      if ('userId' in req) {
        this.#config.tenantId = req.tenantId;
      }
    }
  }
}

async function responseHandler(res: Response, rawResponse?: boolean) {
  if (rawResponse) {
    return res;
  }
  try {
    return await res?.clone().json();
  } catch {
    return res;
  }
}

export function defaultCallbackUrl(config: Config) {
  let cb = null;
  let redirect = null;
  const fallbackCb = parseCallback(config.headers);
  if (fallbackCb) {
    const [, value] = fallbackCb.split('=');
    cb = decodeURIComponent(value);
    if (value) {
      redirect = `${new URL(cb).origin}${
        config.routePrefix
      }${DefaultNileAuthRoutes.INVITE.replace(
        '{tenantId}',
        String(config.tenantId)
      )}`;
    }
  }
  return { callbackUrl: cb, redirectUrl: redirect };
}
