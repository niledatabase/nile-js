import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';

export interface CreateBasicUserRequest {
  email: string;
  password: string;
  preferredName?: string;
  newTenant?: string;
}
export const LoginUserResponseTokenTypeEnum = {
  AccessToken: 'ACCESS_TOKEN',
  RefreshToken: 'REFRESH_TOKEN',
  IdToken: 'ID_TOKEN',
} as const;
export type LoginUserResponseTokenTypeEnum =
  (typeof LoginUserResponseTokenTypeEnum)[keyof typeof LoginUserResponseTokenTypeEnum];

export interface LoginUserResponseToken {
  jwt: string;
  maxAge: number;
  type: LoginUserResponseTokenTypeEnum;
}
export interface LoginUserResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  id: string;
  token: LoginUserResponseToken;
}
export interface User {
  id?: string;
  tenants?: Set<string>;
  email?: string;
  preferredName?: string;
}

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
  ): NileResponse<LoginUserResponse> => {
    const _requester = new Requester(this);

    const _init = this.handleHeaders(init);
    return await _requester.post(req, this.usersUrl, _init);
  };

  updateUser = async (
    userId: string,
    req: NileRequest<User>,
    init?: RequestInit
  ): NileResponse<User> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.put(req, `${this.usersUrl}/${userId}`, _init);
  };

  listUsers = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): NileResponse<User[]> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.get(req, this.tenantUsersUrl, _init);
  };

  linkUser = async (
    req: NileRequest<{ id: string }> | Headers,
    init?: RequestInit
  ): NileResponse<User[]> => {
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
  ): NileResponse<User[]> => {
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
    req: NileRequest<void>,
    init?: RequestInit
  ): NileResponse<User> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return await _requester.get(req, this.meUrl, _init);
  };
}
