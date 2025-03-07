import { CtxOrReq } from 'next-auth/client/_utils';
import { Session } from 'next-auth';

import { fetchData } from './fetchData';
import { __NEXTAUTH } from './process';
import logger from './logger';
import { broadcast } from './broadcast';

export type GetSessionParams = CtxOrReq & {
  event?: 'storage' | 'timer' | 'hidden' | string;
  triggerEvent?: boolean;
  broadcast?: boolean;
  baseUrl?: string;
  init?: RequestInit;
};

export async function getSession(params?: GetSessionParams) {
  if (params?.baseUrl) __NEXTAUTH.baseUrlServer = params.baseUrl;
  const session = await fetchData<Session>(
    'session',
    __NEXTAUTH,
    logger,
    params
  );
  if (params?.broadcast ?? true) {
    broadcast.post({ event: 'session', data: { trigger: 'getSession' } });
  }
  return session;
}
