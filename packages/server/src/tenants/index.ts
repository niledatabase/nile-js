import { RestModels } from '@niledatabase/js';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';

export default class Tenants extends Config {
  constructor(config: Config) {
    super(config);
  }
  get tenantsUrl() {
    return `/databases/${encodeURIComponent(this.databaseId)}/tenants`;
  }
  get tenantUrl() {
    return `/databases/${encodeURIComponent(this.databaseId)}/tenants/${
      this.tenantId ?? '{tenantId}'
    }`;
  }

  createTenant = async (
    req: NileRequest<{ name: string }>,
    init?: RequestInit
  ): NileResponse<RestModels.Tenant> => {
    const _requester = new Requester(this);
    return _requester.post(req, this.tenantsUrl, init);
  };

  getTenant = async (
    req: NileRequest<void>,
    init?: RequestInit
  ): NileResponse<RestModels.Tenant> => {
    const _requester = new Requester(this);
    return _requester.get(req, this.tenantUrl, init);
  };
}
