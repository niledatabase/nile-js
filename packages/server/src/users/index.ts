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
  constructor(config: Config) {
    super(config);
  }

  get baseUrl() {
    return `/databases/${encodeURIComponent(this.databaseId)}`;
  }

  get usersUrl() {
    return `${this.baseUrl}/users`;
  }

  get tenantUsersUrl() {
    return `${this.baseUrl}/tenants/${this.tenantId ?? '{tenantId}'}/users`;
  }

  createTenantUser = async (
    req: NileRequest<CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<LoginUserResponse> => {
    const _requester = new Requester(this);
    return await _requester.post(req, this.tenantUsersUrl, init);
  };

  listUsers = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): NileResponse<User[]> => {
    const _requester = new Requester(this);
    return await _requester.get(req, this.usersUrl, init);
  };

  updateUser = async (
    userId: string,
    req: NileRequest<User>,
    init?: RequestInit
  ): NileResponse<User> => {
    const _requester = new Requester(this);
    return await _requester.put(req, `${this.usersUrl}/${userId}`, init);
  };

  listTenantUsers = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): NileResponse<User[]> => {
    const _requester = new Requester(this);
    return await _requester.get(req, this.tenantUsersUrl, init);
  };

  get meUrl() {
    return `/databases/${encodeURIComponent(this.databaseId)}/users/me`;
  }

  me = async (
    req: NileRequest<void>,
    init?: RequestInit
  ): NileResponse<User> => {
    const _requester = new Requester(this);
    return await _requester.get(req, this.meUrl, init);
  };
}
