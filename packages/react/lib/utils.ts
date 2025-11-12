import { QueryClient, useQuery } from '@tanstack/react-query';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  auth as authorizer,
  PartialAuthorizer,
  Authorizer,
} from '@niledatabase/client';

import { useQueryClientOrDefault } from './queryClient';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type ComponentFetchProps = {
  auth?: Authorizer | PartialAuthorizer;
  init?: RequestInit;
  baseUrl?: string;
  basePath?: string;
};
export function componentFetch(
  fetchUrl: string,
  opts: RequestInit | ComponentFetchProps = {},
  props?: ComponentFetchProps
) {
  let init;
  let rest = opts;

  if ('init' in opts) {
    const { init: _init, ..._rest } = opts;
    init = _init;
    rest = _rest;
  }

  if ('auth' in opts) {
    const { auth, ..._rest } = opts;
    init = { ...init, ...(auth?.requestInit ? auth.requestInit : {}) };
    rest = _rest;
  }
  const newOpts: RequestInit = {
    ...rest,
    ...(init ? init : {}),
    ...(props?.init ? props.init : {}),
    ...(props?.auth?.requestInit ? props.auth.requestInit : {}),
    ...(rest ? rest : {}),
  };
  newOpts.headers = {
    ...('headers' in opts ? opts.headers : {}),
    'content-type': 'application/json; charset=UTF-8',
  };
  // maybe a single `auth` object was passed, so prefer that over props
  // if we don't have a FQDN
  let url = fetchUrl;
  if (!('fetchUrl' in opts) && fetchUrl.startsWith('/')) {
    const auth: Authorizer | PartialAuthorizer | undefined =
      'auth' in opts ? opts.auth : props?.auth;
    const basePath = getBasePath(props, opts, auth);
    const baseUrl = getBaseUrl(props, opts, auth);
    url = `${baseUrl}${basePath}${fetchUrl}`;
  }
  return fetch(url, newOpts);
}
const getBaseUrl = (
  props: ComponentFetchProps | undefined,
  opts: RequestInit | ComponentFetchProps = {},
  auth: Authorizer | PartialAuthorizer | undefined
) => {
  if (props?.baseUrl) {
    return props.baseUrl;
  }

  if ('baseUrl' in opts) {
    return opts.baseUrl;
  }

  if (auth?.state?.baseUrl) {
    return auth?.state?.baseUrl;
  }
  if (authorizer.state.baseUrl) {
    return authorizer.state.baseUrl;
  }
};
const getBasePath = (
  props: ComponentFetchProps | undefined,
  opts: RequestInit | ComponentFetchProps = {},
  auth: Authorizer | PartialAuthorizer | undefined
) => {
  if (props?.basePath) {
    return props.basePath;
  }

  if ('basePath' in opts) {
    return opts.basePath;
  }

  if (auth?.state?.basePath) {
    return auth?.state?.basePath;
  }
  if (authorizer.state.basePath) {
    return authorizer.state.basePath;
  }
};

export type PrefetchParams = {
  baseUrl?: string;
  disableQuery?: boolean;
  init?: RequestInit;
  client?: QueryClient;
  fetchUrl?: string;
};
export function usePrefetch(params?: PrefetchParams) {
  const { baseUrl = '', disableQuery, init, client, fetchUrl } = params ?? {};
  const queryClient = useQueryClientOrDefault(client);
  useQuery(
    {
      queryKey: ['providers', baseUrl],
      queryFn: async () => {
        return await fetch(fetchUrl ?? `${baseUrl}/api/auth/providers`, init);
      },
      enabled: disableQuery !== true,
    },
    queryClient
  );
  useCsrf(params);
}
export function useCsrf(params?: PrefetchParams) {
  const { baseUrl = '', disableQuery, init, client, fetchUrl } = params ?? {};
  const queryClient = useQueryClientOrDefault(client);
  useQuery(
    {
      queryKey: ['csrf', baseUrl],
      queryFn: async () => {
        return await fetch(fetchUrl ?? `${baseUrl}/api/auth/csrf`, init);
      },
      enabled: disableQuery !== true,
    },
    queryClient
  );
}
