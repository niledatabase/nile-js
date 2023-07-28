import { RestModels } from '@theniledev/js';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';

export default class Users extends Config {
  constructor(config: Config) {
    super(config);
  }
  get tenantUsersUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId ?? '{tenantId}'
    }/users`;
  }

  createTenantUser = async (
    req: NileRequest<RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.LoginUserResponse> => {
    const _requester = new Requester(this);
    return await _requester.post(req, this.tenantUsersUrl, init);
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
