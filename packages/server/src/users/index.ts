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

  createUser = async (
    req: NileRequest<CreateBasicUserRequest>,
    init?: RequestInit
  ): Promise<User | Response> => {
    const _requester = new Requester(this);

    const _init = this.handleHeaders(init);
    return await _requester.post(req, this.usersUrl, _init);
  };

  updateUser = async (
    userId: string,
    req: NileRequest<User>,
    init?: RequestInit
  ): Promise<User | Response> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.put(req, `${this.usersUrl}/${userId}`, _init);
  };

  listUsers = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<User[] | Response> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.get(req, this.tenantUsersUrl, _init);
  };

  linkUser = async (
    req: NileRequest<{ id: string }> | Headers,
    init?: RequestInit
  ): Promise<User | Response> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.put(req, this.tenantUsersUrl, _init);
  };

  tenantUsersDeleteUrl = (userId?: string) => {
    return `/tenants/${this.tenantId ?? '{tenantId}'}/users/${
      userId ?? '{userId}'
    }`;
  };

  getUserId = async (req: Headers | NileRequest<{ id: string }>) => {
    if (req instanceof Request) {
      const body = await new Response(req?.body).json();
      if (body) {
        return body.id;
      }
    }
    if ('id' in req) {
      return req.id;
    }
    return null;
  };

  unlinkUser = async (
    req: NileRequest<{ id: string }> | Headers,
    init?: RequestInit
  ): Promise<User[] | Response> => {
    const _requester = new Requester(this);
    const userId = await this.getUserId(req);
    const _init = this.handleHeaders(init);
    return await _requester.delete(
      req,
      this.tenantUsersDeleteUrl(userId),
      _init
    );
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
}
