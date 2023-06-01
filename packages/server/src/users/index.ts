import { RestModels } from '@theniledev/js';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';
import { ResponseError } from '../utils/ResponseError';
import { handleTenantId } from '../utils/fetch';
import { UUID, decode, encode } from '../utils/uuid';

export default class Users extends Config {
  uuid: UUID;
  constructor(config: Config) {
    super(config);
    this.uuid = {
      decode: (input: string) => decode(input),
      encode: (input: string) => encode(input, 'usr_'),
    };
  }
  get createTenantUserUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId
    }/users`;
  }

  createTenantUser = async (
    req: NileRequest<RestModels.CreateBasicUserRequest & { tenantId?: string }>,
    init?: RequestInit
  ): NileResponse<RestModels.LoginUserResponse> => {
    const _requester = new Requester(this);
    const error = await handleTenantId(req, this);
    if (error instanceof ResponseError) {
      return error.response;
    }

    return _requester.post(req, this.createTenantUserUrl, init);
  };
}
