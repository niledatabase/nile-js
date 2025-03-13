/* eslint-disable @typescript-eslint/no-explicit-any */
import { CtxOrReq, now } from 'next-auth/client/_utils';
import { SignOutParams, SignOutResponse } from 'next-auth/react';
import {
  ClientSafeProvider,
  type SignInAuthorizationParams,
  type SignInOptions,
  type LiteralUnion,
  type SignInResponse,
} from 'next-auth/react';
import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from 'next-auth/providers/index';

import {
  AuthConfig,
  AuthState,
  Listener,
  NileSession,
  NonErrorSession,
} from './types';
import { logger, LoggerInstance } from './logger';
import { broadcast } from './broadcast';
import { createObservableObject } from './observable';

export type FetchInit = CtxOrReq & { init?: RequestInit };

export type GetSessionParams = CtxOrReq & {
  event?: 'storage' | 'timer' | 'hidden' | string;
  triggerEvent?: boolean;
  broadcast?: boolean;
  baseUrl?: string;
  init?: RequestInit;
};

export interface SessionProviderProps {
  children: React.ReactNode;
  session?: NileSession;
  baseUrl?: string;
  basePath?: string;
  /**
   * A time interval (in seconds) after which the session will be re-fetched.
   * If set to `0` (default), the session is not polled.
   */
  refetchInterval?: number;
  /**
   * `SessionProvider` automatically refetches the session when the user switches between windows.
   * This option activates this behaviour if set to `true` (default).
   */
  refetchOnWindowFocus?: boolean;
  /**
   * Set to `false` to stop polling when the device has no internet access offline (determined by `navigator.onLine`)
   *
   * [`navigator.onLine` documentation](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine)
   */
  refetchWhenOffline?: false;
}
enum State {
  SESSION = 'getSession',
}

export default class Authorizer {
  state: AuthState;
  logger: LoggerInstance;
  init?: RequestInit;
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

  async initialize(params?: {
    baseUrl?: string;
    session?: NonErrorSession | null | undefined;
  }) {
    const { baseUrl, session } = params ?? {};
    if (baseUrl) this.baseUrl = baseUrl;

    const hasInitialSession = session !== undefined;

    this.state.loading = !hasInitialSession;
    this.state.lastSync = hasInitialSession ? now() : 0;
    this.state.session = session;

    await this.sync();
  }

  get apiBaseUrl() {
    return `${this.state.baseUrl}${this.state.basePath}`;
  }

  async fetchData<T = any>(
    path: string,
    { ctx, req = ctx?.req, init }: FetchInit = {}
  ): Promise<T | undefined> {
    const url = `${this.apiBaseUrl}/${path}`;
    try {
      const options: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(req?.headers?.cookie ? { cookie: req.headers.cookie } : {}),
        },
        ...(this.init ? this.init : {}),
        ...(init ? init : {}),
      };

      if (req?.body) {
        options.body = JSON.stringify(req.body);
        options.method = 'POST';
      }

      const res = await fetch(url, options);
      const data = await res.json();
      this.state.loading = false;
      if (!res.ok) throw data;
      return Object.keys(data).length > 0 ? data : undefined;
    } catch (error) {
      this.logger.error('CLIENT_FETCH_ERROR', { error: error as Error, url });
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
        ...this.init,
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
      this.logger.error('CLIENT_FETCH_ERROR', { error: error as Error, url });
      return undefined;
    }
  }

  async getProviders(params?: FetchInit) {
    return await this.fetchData<
      Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>
    >('providers', params);
  }

  async getCsrfToken(params?: FetchInit) {
    const response = await this.fetchData<{ csrfToken: string }>(
      'csrf',
      params
    );
    return response?.csrfToken;
  }

  async getSession(params?: GetSessionParams): Promise<NonErrorSession> {
    if (this.status === State.SESSION) {
      return;
    }
    this.status = State.SESSION;
    if (params?.init) {
      this.init = params.init;
    }

    if (params?.baseUrl) {
      this.baseUrl = params.baseUrl;
    }

    if (this.state.session && now() < this.state.lastSync) {
      return this.state.session;
    }
    this.state.loading = true;

    const session = await this.fetchData<NonErrorSession | undefined>(
      'session',
      params
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
  async refreshSession(params: any) {
    this.state.loading = true;
    const session = await this.fetchData<NonErrorSession | undefined>(
      'session',
      params
    );

    broadcast.post({ event: 'session', data: { trigger: 'getSession' } });
    this.state.session = session;
    await this.sync('storage');
    return session;
  }
  async signOut<R extends boolean = true>(
    options?: SignOutParams<R> & {
      baseUrl?: string;
      init?: RequestInit;
      fetchUrl?: string;
    }
  ): Promise<R extends true ? undefined : SignOutResponse> {
    const {
      callbackUrl = window.location.href,
      baseUrl,
      init,
      fetchUrl,
    } = options ?? {};
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }

    if (init) {
      this.init = init;
    }
    const baseFetch = fetchUrl ?? this.apiBaseUrl;
    const fetchOptions: RequestInit = {
      method: 'post',
      body: new URLSearchParams({
        csrfToken: String(await this.getCsrfToken(options)),
        callbackUrl,
        json: String(true),
      }),
    };
    const res = await this.fetchFormData<SignOutResponse>(
      `${baseFetch}/signout`,
      fetchOptions
    );

    broadcast.post({ event: 'session', data: { trigger: 'signout' } });

    // in the case you are going x-origin, we don't want to trust the nile.callback-url, so we will not redirect and just refresh the page
    if (this.init?.credentials) {
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
      redirect = true,
      ...remaining
    } = options ?? {};

    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
    if (init) {
      this.init = init;
    }
    const baseFetch = fetchUrl ?? this.apiBaseUrl;
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

    if (this.init?.credentials) {
      window.location.reload();
      return;
    }

    if (redirect || !isSupportingReturn) {
      const url = data?.url ?? callbackUrl;
      window.location.href = url;
      if (url.includes('#')) window.location.reload();
      return;
    }

    const error = data?.url
      ? new URL(data.url).searchParams.get('error')
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
  const defaultUrl = new URL('http://localhost:3000/api/auth');

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
