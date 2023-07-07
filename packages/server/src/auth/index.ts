import { RestModels } from '@theniledev/js';
import isObject from 'lodash/isObject';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';
import { ResponseError } from '../utils/ResponseError';

export default class Auth extends Config {
  constructor(config: Config) {
    super(config);
  }
  get loginUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users/login`;
  }

  login = async (
    req: NileRequest<RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.LoginUserResponse> => {
    const headers =
      req instanceof Request ? new Headers(req.headers) : new Headers();
    const _requester = new Requester(this);
    const res = await _requester.post(req, this.loginUrl, init);
    if (res instanceof ResponseError) {
      return res.response;
    }

    if (res && res.status >= 200 && res.status < 300) {
      const token: RestModels.LoginUserResponse = await res.json();
      const cookie = `${this.api?.cookieKey}=${token.token.jwt}; path=/; samesite=lax; httponly;`;
      headers.set('set-cookie', cookie);
      return new Response(JSON.stringify(token), { status: 200, headers });
    }
    const text = await res.text();
    return new Response(text, { status: res.status });
  };

  get signUpUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users`;
  }

  signUp = async (
    req: NileRequest<RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.LoginUserResponse> => {
    const _requester = new Requester(this);
    return _requester.post(req, this.signUpUrl, init);
  };

  providerUrl(providerName: string) {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId ? encodeURIComponent(this.tenantId) : '{tenantId}'
    }/auth/oidc/providers/${encodeURIComponent(providerName)}`;
  }

  updateProvider = async (
    req: NileRequest<RestModels.RegisterTenantSSORequest>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration> => {
    const _requester = new Requester(this);
    const providerName = 'okta';
    return _requester.put(req, this.providerUrl(providerName), init);
  };

  getProvider = async (
    req: NileRequest<void | string>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration> => {
    const _requester = new Requester(this);
    let providerName = isObject(req) ? req.url.split('/').reverse() : '';
    if (typeof req === 'string') {
      providerName = [req];
    }
    return _requester.get(req, this.providerUrl(providerName[0]), init);
  };
}
