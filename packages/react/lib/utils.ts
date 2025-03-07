import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type ComponentFetchProps = {
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
  const newOpts: RequestInit = {
    ...rest,
    ...(init ? init : {}),
    ...(props?.init ? props.init : {}),
    ...(rest ? { ...rest } : {}),
  };
  newOpts.headers = {
    ...('headers' in opts ? opts.headers : {}),
    'content-type': 'application/json; charset=UTF-8',
  };
  return fetch(fetchUrl, newOpts);
}
