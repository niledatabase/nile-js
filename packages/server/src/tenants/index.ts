import { fetchMe } from '../api/routes/me';
import {
  fetchTenant,
  fetchTenants,
  fetchTenantsByUser,
} from '../api/routes/tenants';
import { fetchTenantUsers } from '../api/routes/tenants/[tenantId]/users';
import { fetchTenantUser } from '../api/routes/tenants/[tenantId]/users/[userId]';
import { NileRequest } from '../types';
import { User } from '../users/types';
import { Config } from '../utils/Config';
import Logger, { LogReturn } from '../utils/Logger';

import { Tenant } from './types';

type ReqContext = { userId?: string; tenantId?: string };
type JoinTenantRequest = string | ReqContext | { id: string };

export default class Tenants {
  #logger: LogReturn;
  #config: Config;
  constructor(config: Config) {
    this.#logger = Logger(config, '[tenants]');
    this.#config = config;
  }

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
