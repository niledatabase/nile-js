import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';

export interface Tenant {
  id: string;
  name?: string;
}

export default class Tenants extends Config {
  headers?: Headers;
  constructor(config: Config, headers?: Headers) {
    super(config);
    this.headers = headers;
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
  get tenantsUrl() {
    return '/tenants';
  }
  get tenantUrl() {
    return `/tenants/${this.tenantId ?? '{tenantId}'}`;
  }

  createTenant = async (
    req: NileRequest<{ name: string }>,
    init?: RequestInit
  ): NileResponse<Tenant> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.post(req, this.tenantsUrl, _init);
  };

  getTenant = async (
    req: NileRequest<void>,
    init?: RequestInit
  ): NileResponse<Tenant> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.get(req, this.tenantUrl, _init);
  };
}
