import { RestModels } from '@niledatabase/js';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';
import { ResponseError } from '../utils/ResponseError';
import {
  X_NILE_TENANT,
  X_NILE_USER_ID,
  getTenantFromHttp,
} from '../utils/fetch';
import { updateToken, updateUserId } from '../utils/Event';

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
    const headers = new Headers({ 'content-type': 'application/json' });
    const _requester = new Requester(this);

    const params =
      req instanceof Request
        ? new URL(req.url).searchParams
        : new URLSearchParams();

    const sso = params.get('sso');

    if (sso === 'true') {
      const providerRes = await this.listProviders(
        (req as Request).clone(),
        init
      );
      // if you have a provider, log them in
      if (
        providerRes &&
        providerRes.status >= 200 &&
        providerRes.status < 300
      ) {
        const providers = await new Response(providerRes.body).json();
        if (providers.length > 0) {
          if (providers.length > 1) {
            return new Response(JSON.stringify(providers), { status: 200 });
            // a user has to make a choice
          }

          // is there a way to do this? probably not.
          headers.set(X_NILE_TENANT, providers[0].tenantId);
          headers.append(
            'set-cookie',
            `tenantId=${providers[0].tenantId}; path=/; httponly;`
          );
          // const ssoResp = await this.loginSSO(req);
          return new Response(
            JSON.stringify({
              redirectURI: `${this.api.basePath}${this.loginSSOUrl('okta')}`,
            }),
            { status: 200 }
          );
          // make it a client side redirect, because of the headers
          // if there is no provider, require a password.
        }
      }
    }

    const res = await _requester.post(req, this.loginUrl, init).catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      return e;
    });
    if (res instanceof ResponseError) {
      return res.response;
    }
    if (res && res.status >= 200 && res.status < 300) {
      const token: RestModels.LoginUserResponse = await res.json();
      const cookie = `${this.api?.cookieKey}=${token.token.jwt}; path=/; samesite=lax; httponly;`;
      headers.append('set-cookie', cookie);
      const { tenants } = token;
      const tenant = tenants?.values();
      const tenantId = tenant?.next().value;
      headers.set(X_NILE_TENANT, tenantId);
      headers.append('set-cookie', `tenantId=${tenantId}; path=/; httponly;`);
      updateToken(token.token.jwt);

      return new Response(JSON.stringify(token), { status: 200, headers });
    }
    const text = await res.text();
    return new Response(text, { status: res.status });
  };

  loginSSO = (redirectUrl: string) => {
    const ssoLogin = async (
      req: NileRequest<unknown>
    ): NileResponse<RestModels.TenantSSORegistration[]> => {
      const headers = new Headers();
      const body = await (req as Request).formData();
      const accessToken = (await body.get('access_token')) as string;
      const tenantId = (await body.get('tenantId')) as string;
      const cookie = `${this.api?.cookieKey}=${accessToken}; path=/; samesite=lax; httponly;`;
      updateToken(accessToken);
      headers.append('set-cookie', cookie);
      headers.set(X_NILE_TENANT, tenantId);
      headers.append('set-cookie', `tenantId=${tenantId}; path=/; httponly;`);
      headers.set('Location', redirectUrl);
      return new Response(null, {
        headers,
        status: 303,
      });
    };
    return ssoLogin;
  };

  loginSSOUrl = (provider: string) => {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId ?? '{tenantId}'
    }/auth/oidc/providers/${provider}/login`;
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
    const headers = new Headers();
    const _requester = new Requester(this);
    const res = await _requester.post(req, this.signUpUrl, init).catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      return e;
    });
    if (res instanceof ResponseError) {
      return res.response;
    }
    if (res && res.status >= 200 && res.status < 300) {
      const token: RestModels.LoginUserResponse = await res.json();
      const cookie = `${this.api?.cookieKey}=${token.token?.jwt}; path=/; samesite=lax; httponly;`;
      headers.append('set-cookie', cookie);
      const { id } = token;
      updateToken(token.token?.jwt);
      updateUserId(id);
      headers.set(X_NILE_USER_ID, id);
      headers.append('set-cookie', `userId=${id}; path=/; httponly;`);
      return new Response(JSON.stringify(token), { status: 201, headers });
    }
    const text = await res.text();
    return new Response(text, { status: res.status });
  };

  updateProviderUrl(providerName: string) {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId ? encodeURIComponent(this.tenantId) : '{tenantId}'
    }/auth/oidc/providers/${encodeURIComponent(providerName)}`;
  }

  get listTenantProvidersUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId ? encodeURIComponent(this.tenantId) : '{tenantId}'
    }/auth/oidc/providers`;
  }

  listTenantProviders = async (
    req: NileRequest<void | Headers>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration[]> => {
    const _requester = new Requester(this);
    return _requester.get(req, this.listTenantProvidersUrl, init);
  };

  createProvider = async (
    req: NileRequest<RestModels.RegisterTenantSSORequest>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration> => {
    const _requester = new Requester(this);
    const providerName = 'okta';
    return _requester.post(req, this.updateProviderUrl(providerName), init);
  };

  updateProvider = async (
    req: NileRequest<RestModels.RegisterTenantSSORequest>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration> => {
    const _requester = new Requester(this);
    const providerName = 'okta';
    return _requester.put(req, this.updateProviderUrl(providerName), init);
  };

  providerUrl(email?: undefined | string) {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(
      this.database
    )}/tenants/auth/oidc/providers${
      email ? `?email=${encodeURIComponent(email)}` : ''
    }`;
  }

  listProviders = async (
    req: NileRequest<void | RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration[]> => {
    const _requester = new Requester(this);
    let body: { email: string } | undefined;
    // this is a get. Get the email from the response body so the request is filtered.
    if (req && 'body' in req) {
      body = await new Response(req.body as BodyInit).json();
    }
    return _requester.get(req, this.providerUrl(body?.email), init);
  };

  getSSOCallbackUrl = (param: Headers | string) => {
    let tenantId;
    if (typeof tenantId === 'string') {
      tenantId = param;
    } else if (param instanceof Headers) {
      tenantId = getTenantFromHttp(param, this);
    }

    return `${this.api.basePath}/workspaces/${this.workspace}/databases/${this.database}/tenants/${tenantId}/auth/oidc/callback`;
  };
}
