import { Config } from '../utils/Config';
import Requester, { NileRequest } from '../utils/Requester';

import { CreateBasicUserRequest, User } from './types';

export default class Users extends Config {
  headers?: Headers;
  constructor(config: Config, headers?: Headers) {
    super(config);
    this.headers = headers;
  }

  get usersUrl() {
    return '/users';
  }

  get tenantUsersUrl() {
    return `/tenants/${this.tenantId ?? '{tenantId}'}/users`;
  }
  get linkUsersUrl() {
    return `/tenants/${this.tenantId ?? '{tenantId}'}/users/${
      this.userId ?? '{userId}'
    }/link`;
  }

  get tenantUserUrl() {
    return `/tenants/${this.tenantId ?? '{tenantId}'}/users/${
      this.userId ?? '{userId}'
    }`;
  }
  handleHeaders(init?: RequestInit) {
    if (this.headers) {
      if (init) {
        init.headers = new Headers({ ...this.headers, ...init?.headers });
        return init;
      } else {
        init = {
          headers: this.headers,
        };
        return init;
      }
    }
    return undefined;
  }

  createUser = async <T = User | Response>(
    req: NileRequest<CreateBasicUserRequest>,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);

    const _init = this.handleHeaders(init);
    return (await _requester.post(req, this.usersUrl, _init)) as T;
  };

  createTenantUser = async <T = User | Response>(
    req: NileRequest<CreateBasicUserRequest>,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);

    const _init = this.handleHeaders(init);
    return (await _requester.post(req, this.tenantUsersUrl, _init)) as T;
  };

  updateUser = async <T = User[] | Response>(
    req: NileRequest<
      Partial<Omit<User, 'email' | 'tenants' | 'created' | 'updated'>>
    >,
    init?: RequestInit
  ): Promise<T> => {
    let _req;
    if (req && 'id' in req) {
      _req = new Request(`${this.api.basePath}${this.tenantUserUrl}`, {
        body: JSON.stringify(req),
        method: 'PUT',
      });
      this.userId = String(req.id);
    } else {
      _req = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return (await _requester.put(_req, this.tenantUserUrl, _init)) as T;
  };

  listUsers = async <T = User[] | Response>(
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return (await _requester.get(req, this.tenantUsersUrl, _init)) as T;
  };

  linkUser = async <T = User | Response>(
    req: NileRequest<{ id: string; tenantId?: string }> | Headers | string,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    if (typeof req === 'string') {
      this.userId = req;
    } else {
      if ('id' in req) {
        this.userId = req.id;
      }
      if ('tenantId' in req) {
        this.tenantId = req.tenantId;
      }
    }

    const _init = this.handleHeaders(init);
    return (await _requester.put(req, this.linkUsersUrl, _init)) as T;
  };

  unlinkUser = async <T = Response>(
    req: NileRequest<{ id: string; tenantId?: string }> | Headers | string,
    init?: RequestInit
  ): Promise<T> => {
    if (typeof req === 'string') {
      this.userId = req;
    } else {
      if ('id' in req) {
        this.userId = req.id;
      }
      if ('tenantId' in req) {
        this.tenantId = req.tenantId;
      }
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return (await _requester.delete(req, this.linkUsersUrl, _init)) as T;
  };

  get meUrl() {
    return '/me';
  }

  me = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<User | Response> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.get(req, this.meUrl, _init);
  };
  updateMe = async <T = User | Response>(
    req:
      | NileRequest<
          Partial<
            Omit<User, 'email' | 'id' | 'tenants' | 'created' | 'updated'>
          >
        >
      | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return (await _requester.put(req, this.meUrl, _init)) as T;
  };
}
