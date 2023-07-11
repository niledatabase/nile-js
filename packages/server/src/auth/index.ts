import { RestModels } from '@theniledev/js';

import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';
import { ResponseError } from '../utils/ResponseError';
import { X_NILE_TENANT } from '../utils/fetch';

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

    if (sso) {
      const providerRes = await this.getProviders(
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
            // someone has to do somethig about this
          }

          // is there a way to do this? probably not.
          headers.set(X_NILE_TENANT, providers[0].tenantId);
          const ssoResp = await new Response(
            (
              await this.loginSSO(req)
            ).body
          ).json();
          const redirectUrl = ssoResp.uri;
          return Response.redirect(redirectUrl, 302);
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
      headers.set('set-cookie', cookie);
      const hasTenantId = headers.get(X_NILE_TENANT);
      if (!hasTenantId) {
        const { tenants } = token;
        const tenant = tenants?.values();
        const tenantId = tenant?.next().value;
        headers.set(X_NILE_TENANT, tenantId);
      }
      return new Response(JSON.stringify(token), { status: 200, headers });
    }
    const text = await res.text();
    return new Response(text, { status: res.status });
  };

  loginSSOUrl = (provider: string) => {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId ?? '{tenantId}'
    }/auth/oidc/${provider}/login`;
  };

  loginSSO = async (
    req: NileRequest<RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ) => {
    const _requester = new Requester(this);
    return _requester.get(req, this.loginSSOUrl('okta'), init);
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

  updateProviderUrl(providerName: string) {
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
    return _requester.post(req, this.updateProviderUrl(providerName), init);
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
  getProviders = async (
    req: NileRequest<void | RestModels.CreateBasicUserRequest>,
    init?: RequestInit
  ): NileResponse<RestModels.TenantSSORegistration> => {
    const _requester = new Requester(this);
    let body: { email: string } | undefined;
    // this is a get. Get the email from the response body so the request is filtered.
    if (req && 'body' in req) {
      body = await new Response(req.body as BodyInit).json();
    }
    return _requester.get(req, this.providerUrl(body?.email), init);
  };
}
