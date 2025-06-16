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

/**
 * Convenience wrapper around the tenant endpoints. These methods call
 * the `fetch*` helpers in `packages/server/src/api/routes/tenants` which
 * in turn hit routes such as `/api/tenants` and `/api/tenants/{tenantId}`.
 * See those files for the Swagger definitions.
 */

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
  /**
   * Create a new tenant using `POST /api/tenants`.
   * See `packages/server/src/api/routes/tenants/POST.ts` for the
   * `createTenant` operation definition.
   */
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

  /**
   * Delete a tenant using `DELETE /api/tenants/{tenantId}`.
   * The OpenAPI operation is defined in
   * `packages/server/src/api/routes/tenants/[tenantId]/DELETE.ts`.
   */
  delete<T = Response>(id?: string): Promise<T>;
  /**
   * Delete a tenant using `DELETE /api/tenants/{tenantId}`.
   * See `packages/server/src/api/routes/tenants/[tenantId]/DELETE.ts`.
   */
  delete<T = Response>(payload: { id: string }): Promise<T>;
  /**
   * Remove a tenant via `DELETE /api/tenants/{tenantId}`.
   *
   * @param req - The tenant to remove or context containing the id.
   */
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
  /**
   * Fetch details for a tenant using `GET /api/tenants/{tenantId}`.
   *
   * @param req - Tenant identifier or context.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
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
  /**
   * Modify a tenant using `PUT /api/tenants/{tenantId}`.
   *
   * @param req - Tenant data to update. Can include an id.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
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
  /**
   * List tenants for the current user via `GET /api/tenants`.
   * See `packages/server/src/api/routes/tenants/GET.ts` for details.
   */
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
  /**
   * Leave the current tenant using `DELETE /api/tenants/{tenantId}/users/{userId}`.
   *
   * @param [req] - Optionally specify the tenant id to leave.
   */
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
  /**
   * Add a user to a tenant via `PUT /api/tenants/{tenantId}/users/{userId}`.
   *
   * @param req - User and tenant identifiers or context.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
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

  /**
   * Remove a user from a tenant with `DELETE /api/tenants/{tenantId}/users/{userId}`.
   *
   * @param req - User and tenant identifiers or context.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
  async removeMember(
    req: JoinTenantRequest,
    rawResponse?: boolean
  ): Promise<Response> {
    this.#handleContext(req);
    const res = await fetchTenantUser(this.#config, 'DELETE');
    return responseHandler(res, rawResponse);
  }
  /**
   * List users for a tenant via `GET /api/tenants/{tenantId}/users`.
   *
   * @param [req] - Tenant identifier or context.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
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

  /**
   * List invites for the current tenant via `GET /api/tenants/{tenantId}/invites`.
   */
  async invites<T = Invite[] | Response>(): Promise<T> {
    const res = await fetchInvites(this.#config);

    return responseHandler(res);
  }

  /**
   * Send an invitation via `POST /api/tenants/{tenantId}/invite`.
   *
   * @param req - Email and optional callback/redirect URLs.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
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

  /**
   * Accept an invite using `PUT /api/tenants/{tenantId}/invite`.
   *
   * @param req - Identifier and token from the invite email.
   * @param [rawResponse] - When true, return the raw {@link Response}.
   */
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

  /**
   * Delete a pending invite using `DELETE /api/tenants/{tenantId}/invite/{inviteId}`.
   *
   * @param req - Identifier of the invite to remove.
   */
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

/**
 * Handle the fetch response, optionally parsing JSON.
 *
 * @param res - Response from fetch.
 * @param [rawResponse] - When true, return the response untouched.
 */
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

/**
 * Parse the `nile.callback-url` cookie to determine a callback and redirect.
 *
 * @param config - Configuration whose headers may contain the cookie.
 * @returns Parsed callback and redirect URLs.
 */
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
