import { Config } from '../utils/Config';
import Requester, { NileRequest } from '../utils/Requester';

import { Tenant } from './types';

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
    req: NileRequest<{ name: string }> | Headers | string,
    init?: RequestInit
  ): Promise<Tenant | Response> => {
    let _req;
    if (typeof req === 'string') {
      _req = new Request(`${this.api.basePath}${this.tenantsUrl}`, {
        body: JSON.stringify({ name: req }),
        method: 'POST',
      });
    } else {
      _req = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.post(_req, this.tenantsUrl, _init);
  };

  getTenant = async (
    req: NileRequest<{ id: string }> | Headers | string | void,
    init?: RequestInit
  ): Promise<Tenant | Response> => {
    if (typeof req === 'string') {
      this.tenantId = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.get<Tenant>(req, this.tenantUrl, _init);
  };

  get tenantListUrl() {
    return `/users/${this.userId ?? '{userId}'}/tenants`;
  }

  listTenants = async (
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<Tenant[] | Response> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.get<Tenant[]>(req, this.tenantListUrl, _init);
  };
}
