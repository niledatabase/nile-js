import { Config } from '../utils/Config';
import Requester, { NileRequest } from '../utils/Requester';

import { Tenant } from './types';

export default class Tenants extends Config {
  constructor(config: Config) {
    super(config);
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

  createTenant = async <T = Tenant | Response>(
    req: NileRequest<{ name: string; id?: string }> | Headers | string,
    init?: RequestInit
  ): Promise<T> => {
    let _req;
    if (typeof req === 'string') {
      _req = new Request(`${this.apiUrl}${this.tenantsUrl}`, {
        body: JSON.stringify({ name: req }),
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });
    } else if ('name' in req || 'id' in req) {
      _req = new Request(`${this.apiUrl}${this.tenantsUrl}`, {
        body: JSON.stringify(req),
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });
    } else {
      _req = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.post(_req, this.tenantsUrl, _init) as T;
  };

  getTenant = async <T = Tenant | Response>(
    req: NileRequest<{ id: string }> | Headers | string | void,
    init?: RequestInit
  ): Promise<T> => {
    if (typeof req === 'string') {
      this.tenantId = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.get<Tenant>(req, this.tenantUrl, _init) as T;
  };

  get tenantListUrl() {
    return `/users/${this.userId ?? '{userId}'}/tenants`;
  }

  listTenants = async <T = Tenant[] | Response>(
    req: NileRequest<void> | Headers,
    init?: RequestInit
  ): Promise<T> => {
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.get<Tenant[]>(req, this.tenantListUrl, _init) as T;
  };

  deleteTenant = async <T = Response>(
    req: NileRequest<void> | Headers | string,
    init?: RequestInit
  ): Promise<T> => {
    if (typeof req === 'string') {
      this.tenantId = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.delete(req, this.tenantUrl, _init) as T;
  };
  updateTenant = async <T = Tenant | Response>(
    req: NileRequest<void> | Headers | { name: string },
    init?: RequestInit
  ): Promise<T> => {
    let _req;
    if (req && 'name' in req) {
      _req = new Request(`${this.apiUrl}${this.tenantUrl}`, {
        body: JSON.stringify(req),
        method: 'PUT',
      });
    } else {
      _req = req;
    }
    const _requester = new Requester(this);
    const _init = this.handleHeaders(init);
    return _requester.put<Tenant>(_req, this.tenantUrl, _init) as T;
  };
}
