import { RestModels } from '@niledatabase/js';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';

export default class Users extends Config {
  constructor(config: Config) {
    super(config);
  }

  get baseUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}`;
  }

  get usersUrl() {
    return `${this.baseUrl}/users`;
  }

  get tenantUsersUrl() {
    return `${this.baseUrl}/tenants/${this.tenantId ?? '{tenantId}'}/users`;
  }

  createTenantUser = async (
    req: NileRequest<RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.LoginUserResponse> => {
    const _requester = new Requester(this);
    return await _requester.post(req, this.tenantUsersUrl, init);
  };

  listUsers = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): NileResponse<RestModels.User[]> => {
    const _requester = new Requester(this);
    return await _requester.get(req, this.usersUrl, init);
  };

  updateUser = async (
    userId: string,
    req: NileRequest<RestModels.UpdateUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.User> => {
    const _requester = new Requester(this);
    return await _requester.put(req, `${this.usersUrl}/${userId}`, init);
  };

  listTenantUsers = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): NileResponse<RestModels.User[]> => {
    const _requester = new Requester(this);
    return await _requester.get(req, this.tenantUsersUrl, init);
  };

  get meUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users/me`;
  }

  me = async (
    req: NileRequest<void>,
    init?: RequestInit
  ): NileResponse<RestModels.User> => {
    const _requester = new Requester(this);
    return await _requester.get(req, this.meUrl, init);
  };
}
