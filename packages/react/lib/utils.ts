import { QueryClient, useQuery } from '@tanstack/react-query';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import Authorizer from './auth/Authorizer';
import { PartialAuthorizer } from './auth/types';
import {
  buildProvidersQuery,
  buildCsrfQuery,
  QueryBuilderParams,
} from './requestMaker';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type ComponentFetchProps = {
  auth?: Authorizer | PartialAuthorizer;
  init?: RequestInit;
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
    if (auth) {
      url = `${auth?.state?.baseUrl}${fetchUrl}`;
    }
  }
  return fetch(url, newOpts);
}

export type PrefetchParams = QueryBuilderParams & {
  client?: QueryClient;
};

export function usePrefetch(params?: PrefetchParams) {
  const { client } = params ?? {};
  useQuery(buildProvidersQuery(params), client);
  useQuery(buildCsrfQuery(params), client);
}

export function useCsrf(params?: PrefetchParams) {
  const { client } = params ?? {};
  useQuery(buildCsrfQuery(params), client);
}
