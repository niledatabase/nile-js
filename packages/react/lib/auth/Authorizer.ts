/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ActiveSession,
  AuthConfig,
  AuthState,
  Config,
  CtxOrReq,
  BuiltInProviderType,
  RedirectableProviderType,
  ClientSafeProvider,
  SignInAuthorizationParams,
  SignInOptions,
  LiteralUnion,
  SignInResponse,
  Listener,
  NonErrorSession,
  PartialAuthorizer,
  SignOutParams,
  SignOutResponse,
} from './types';
import { logger, LoggerInstance } from './logger';
import { broadcast, now } from './broadcast';
import { createObservableObject } from './observable';

export type GetSessionParams = CtxOrReq & {
  event?: 'storage' | 'timer' | 'hidden' | string;
  triggerEvent?: boolean;
  broadcast?: boolean;
  baseUrl?: string;
  init?: RequestInit;
};

enum State {
  SESSION = 'getSession',
}

export default class Authorizer {
  state: AuthState;
  logger: LoggerInstance;
  requestInit?: RequestInit;
  addListener: (cb: Listener) => void;
  removeListener: (cb: Listener) => void;
  status: null | State;
  constructor(config?: AuthConfig) {
    const { proxy, addListener, removeListener } =
      createObservableObject<AuthState>(
        {
          basePath: parseUrl(config?.basePath).path,
          baseUrl: parseUrl(config?.baseUrl).origin,
          lastSync: 0,
          getSession: () => undefined,
          session: undefined,
          loading: true,
        },
        config?.listenerKeys,
        'auth'
      );
    this.state = proxy;
    this.addListener = addListener;
    this.removeListener = removeListener;
    this.logger = logger(this);
    this.status = null;
  }

  async sync(
    event?: 'storage' | 'timer' | 'hidden' | 'poll' | 'visibilitychange'
  ) {
    try {
      const storageEvent = event === 'storage';
      if (storageEvent || !this.state.session) {
        this.state.getSession = await this.getSession;
        this.state.lastSync = now();
      }
      if (!event || this.state.session == null || now() < this.state.lastSync) {
        return;
      }
      this.state.lastSync = Date.now();
      this.state.session = await this.getSession();
    } catch (error) {
      this.logger.error('CLIENT_SESSION_ERROR', error as Error);
    }
  }

  set baseUrl(val: string) {
    this.state.baseUrl = val;
    this.logger = logger(this);
  }

  get baseUrl() {
    this.logger = logger(this);
    return this.state.baseUrl;
  }

  configure(config?: Config) {
    if (config?.basePath) this.state.basePath = parseUrl(config?.basePath).path;
    if (config?.baseUrl) this.baseUrl = config.baseUrl;
    if (config?.init) this.requestInit = config.init;

    return this;
  }
  // return the bare minimum config for convenience
  // this is useful for `@niledatabase/web`
  sanitize(): PartialAuthorizer {
    return {
      state: {
        baseUrl: this.baseUrl,
        session: {
          user: {
            email: (this.state.session as ActiveSession)?.user?.email,
          },
        },
      },
      requestInit: this.requestInit,
    };
  }

  async initialize(params?: {
    baseUrl?: string;
    session?: NonErrorSession | null | undefined;
    event?: 'storage' | 'timer' | 'hidden' | 'poll' | 'visibilitychange';
  }) {
    const { baseUrl, session, event } = params ?? {};

    if (baseUrl) this.baseUrl = baseUrl;

    const hasInitialSession = session !== undefined;

    this.state.loading = !hasInitialSession;
    this.state.lastSync = hasInitialSession ? now() : 0;
    this.state.session = session;

    await this.sync(event);
  }

  get apiBaseUrl() {
    return `${this.baseUrl}${this.state.basePath}`;
  }

  async fetchData<T = any>(
    url: string,
    init?: RequestInit
  ): Promise<T | undefined> {
    try {
      const options: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        },
        ...(this.requestInit ? this.requestInit : {}),
        ...init,
      };

      const res = await fetch(url, options);
      const data = await res.json();
      this.state.loading = false;
      if (!res.ok) throw data;
      return Object.keys(data).length > 0 ? data : undefined;
    } catch (error) {
      if (error instanceof Error) {
        // this is fine
        if (!error.message.includes('is not valid JSON')) {
          this.logger.error('CLIENT_FETCH_ERROR', {
            error: error as Error,
            url,
          });
        }
      }
      return undefined;
    }
  }
  async fetchFormData<T = { url: string }>(
    url: string,
    init: RequestInit
  ): Promise<
    | {
        data: T;
        status: number;
        ok: boolean;
        url: string;
      }
    | undefined
  > {
    try {
      const res = await fetch(url, {
        ...this.requestInit,
        ...init,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return {
        data: (await res.json()) as T,
        status: res.status,
        ok: res.ok,
        url: url,
      };
    } catch (error) {
      if (error instanceof Error) {
        // this is fine
        if (!error.message.includes('is not valid JSON')) {
          this.logger.error('CLIENT_FETCH_ERROR', {
            error: error as Error,
            url,
          });
        }
      }
      return undefined;
    }
  }

  async getProviders() {
    return await this.fetchData<
      Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>
    >(`${this.apiBaseUrl}/auth/providers`);
  }

  async getCsrfToken() {
    const response = await this.fetchData<{ csrfToken: string }>(
      `${this.apiBaseUrl}/auth/csrf`
    );
    return response?.csrfToken;
  }

  async getSession(params?: GetSessionParams): Promise<NonErrorSession> {
    if (this.status === State.SESSION) {
      return;
    }
    this.status = State.SESSION;
    if (params?.init) {
      this.requestInit = params.init;
    }

    if (params?.baseUrl) {
      this.baseUrl = params.baseUrl;
    }

    if (this.state.session && now() < this.state.lastSync) {
      this.status = null;
      return this.state.session;
    }
    this.state.loading = true;

    const session = await this.fetchData<NonErrorSession | undefined>(
      `${this.apiBaseUrl}/auth/session`
    );
    if (params?.broadcast ?? true) {
      broadcast.post({ event: 'session', data: { trigger: 'getSession' } });
    }
    this.status = null;
    if (session) {
      this.state.session = session;
      await this.sync('storage');
      return { ...session, loading: this.state.loading };
    }
    return { loading: this.state.loading } as NonErrorSession;
  }
  async refreshSession() {
    this.state.loading = true;
    const session = await this.fetchData<NonErrorSession | undefined>(
      `${this.apiBaseUrl}/auth/session`
    );

    broadcast.post({ event: 'session', data: { trigger: 'getSession' } });
    this.state.session = session;
    await this.sync('storage');
    return session;
  }
  async signOut<R extends boolean = true>(
    options?: SignOutParams<R> & {
      baseUrl?: string;
      auth?: Authorizer | PartialAuthorizer;
      fetchUrl?: string;
      basePath?: string;
    }
  ): Promise<R extends true ? undefined : SignOutResponse> {
    const {
      callbackUrl = window.location.href,
      baseUrl,
      auth,
      fetchUrl,
      basePath,
    } = options ?? {};

    if (basePath) {
      this.state.basePath = basePath;
    }

    if (baseUrl) {
      this.baseUrl = baseUrl;
    }

    if (auth) {
      this.requestInit = auth.requestInit;
      if (auth.state?.baseUrl) {
        this.baseUrl = auth.state.baseUrl;
      }
    }
    const baseFetch = fetchUrl ?? `${this.apiBaseUrl}/auth/signout`;
    const fetchOptions: RequestInit = {
      method: 'post',
      body: new URLSearchParams({
        csrfToken: String(await this.getCsrfToken()),
        callbackUrl,
        json: String(true),
      }),
    };
    const res = await this.fetchFormData<SignOutResponse>(
      baseFetch,
      fetchOptions
    );

    broadcast.post({ event: 'session', data: { trigger: 'signout' } });

    // in the case you are going x-origin, we don't want to trust the nile.callback-url, so we will not redirect and just refresh the page
    if (this.requestInit?.credentials) {
      window.location.href = callbackUrl;
      if (callbackUrl.includes('#')) window.location.reload();
      return undefined as R extends true ? undefined : SignOutResponse;
    }
    if (options?.redirect ?? true) {
      const url = res?.data?.url ?? callbackUrl;
      window.location.href = url;
      // If url contains a hash, the browser does not reload the page. We reload manually
      if (url.includes('#')) window.location.reload();
      return undefined as R extends true ? undefined : SignOutResponse;
    }

    await this.state.getSession({ event: 'storage' });

    return res?.data as R extends true ? undefined : SignOutResponse;
  }
  async signIn<P extends RedirectableProviderType | undefined = undefined>(
    provider?: LiteralUnion<
      P extends RedirectableProviderType
        ? P | BuiltInProviderType
        : BuiltInProviderType
    >,
    options?: SignInOptions & {
      baseUrl?: string;
      init?: ResponseInit;
      fetchUrl?: string;
      auth?: Authorizer | PartialAuthorizer;
    },
    authorizationParams?: SignInAuthorizationParams
  ): Promise<
    P extends RedirectableProviderType ? SignInResponse | undefined : undefined
  > {
    const {
      callbackUrl = window.location.href,
      baseUrl,
      fetchUrl,
      init,
      auth,
      redirect = true,
      ...remaining
    } = options ?? {};

    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
    if (auth) {
      if (auth.requestInit) {
        this.requestInit = auth.requestInit;
      }
      if (auth.state?.baseUrl) {
        this.baseUrl = auth.state.baseUrl;
      }
    }
    if (init) {
      this.requestInit = init;
    }

    const baseFetch = fetchUrl ?? `${this.apiBaseUrl}/auth`;
    const providers = await this.getProviders();

    if (!providers) {
      return { error: 'No providers enabled' } as any;
    }

    if (!provider || !(provider in providers)) {
      return { error: `Provider ${provider} not enabled` } as any;
    }

    const isCredentials = providers[provider].type === 'credentials';
    const isEmail = providers[provider].type === 'email';
    const isSupportingReturn = isCredentials || isEmail;

    const signInUrl = `${baseFetch}/${
      isCredentials ? 'callback' : 'signin'
    }/${provider}`;

    const _signInUrl = `${signInUrl}${
      authorizationParams ? `?${new URLSearchParams(authorizationParams)}` : ''
    }`;

    const data = await this.fetchFormData(_signInUrl, {
      method: 'post',
      body: new URLSearchParams({
        ...remaining,
        csrfToken: String(await this.getCsrfToken()),
        callbackUrl,
        json: String(true),
      }),
    });

    if (this.requestInit?.credentials && isSupportingReturn) {
      window.location.reload();
      return;
    }

    if (redirect || !isSupportingReturn) {
      const url = data?.data.url ?? callbackUrl;
      window.location.href = url;
      if (url.includes('#')) window.location.reload();
      return;
    }

    const error = data?.url
      ? new URL(String(data?.url)).searchParams.get('error')
      : 'Unable to parse response from server';

    if (data?.ok) {
      await this.initialize();
      await this.state.getSession({ event: 'storage' });
    }
    return {
      error,
      status: data?.status,
      ok: data?.ok,
      url: error ? null : data?.url,
    } as any;
  }
  async signUp(options: {
    baseUrl?: string;
    init?: ResponseInit;
    fetchUrl?: string;
    newTenantName?: string;
    createTenant?: string | boolean;
    email: string;
    password: string;
    auth?: Authorizer | PartialAuthorizer;
    tenantId?: string;
    callbackUrl?: string;
    redirect?: boolean;
  }) {
    const {
      password,
      tenantId,
      fetchUrl,
      newTenantName,
      createTenant,
      baseUrl,
      init,
      email,
      auth,
      callbackUrl = window.location.href,
    } = options;

    if (baseUrl) {
      this.baseUrl = baseUrl;
    }

    if (auth) {
      if (auth.requestInit) {
        this.requestInit = auth.requestInit;
      }
      if (auth.state?.baseUrl) {
        this.baseUrl = auth.state.baseUrl;
      }
    }

    if (init) {
      this.requestInit = init;
    }

    const searchParams = new URLSearchParams();

    if (newTenantName) {
      searchParams.set('newTenantName', newTenantName);
    } else if (createTenant) {
      if (typeof createTenant === 'boolean') {
        searchParams.set('newTenantName', email);
      } else if (typeof createTenant === 'string') {
        searchParams.set('newTenantName', createTenant);
      }
    }
    if (tenantId) {
      searchParams.set('tenantId', tenantId);
    }

    let signUpUrl = fetchUrl ?? `${this.apiBaseUrl}/signup`;
    if (searchParams.size > 0) {
      signUpUrl += `?${searchParams}`;
    }
    const data = await this.fetchData(signUpUrl, {
      method: 'post',
      body: JSON.stringify({ email, password }),
    });
    if (data) {
      await this.initialize({ event: 'storage' });
      await this.getSession({ event: 'storage' });
    }
    const error = data?.url
      ? new URL(data.url).searchParams.get('error')
      : 'Unable to parse response from server';

    if (this.requestInit?.credentials) {
      window.location.reload();
      return;
    }

    if ((options?.redirect ?? true) && !error) {
      const url = callbackUrl;
      window.location.href = url;
      // If url contains a hash, the browser does not reload the page. We reload manually
      if (url.includes('#')) window.location.reload();
    }

    return {
      data,
      error,
    } as any;
  }
}
export interface InternalUrl {
  /** @default "http://localhost:3000" */
  origin: string;
  /** @default "localhost:3000" */
  host: string;
  /** @default "/api/auth" */
  path: string;
  /** @default "http://localhost:3000/api/auth" */
  base: string;
  /** @default "http://localhost:3000/api/auth" */
  toString: () => string;
}

function parseUrl(url?: string): InternalUrl {
  let defaultUrl = new URL('http://localhost:3000');
  if (typeof window !== 'undefined') {
    defaultUrl = new URL(`${window.location.origin}/api`);
  }

  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }

  const _url = new URL(url ?? defaultUrl);
  const path = (_url.pathname === '/' ? defaultUrl.pathname : _url.pathname)
    // Remove trailing slash
    .replace(/\/$/, '');

  const base = `${_url.origin}${path}`;

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  };
}

export const authorizer = new Authorizer();

const _auth = () => {
  return authorizer;
};

export const auth: Authorizer = _auth();

export const getSession = async function getSession(params?: GetSessionParams) {
  return await auth.getSession(params);
};

export const getCsrfToken = async function getCsrfToken() {
  return auth.getCsrfToken();
};

export const getProviders = async function getProviders() {
  return auth.getProviders();
};

export const signOut: typeof authorizer.signOut = async function signOut(
  options
) {
  return auth.signOut(options);
};
export const signIn: typeof authorizer.signIn = async function signOut(
  provider,
  options,
  authParams
) {
  return auth.signIn(provider, options, authParams);
};

export const signUp: typeof authorizer.signUp = async function signUp(options) {
  return auth.signUp(options);
};
