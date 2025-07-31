import { NonErrorSession } from './types';

export function getStatus(
  load: boolean,
  sess: NonErrorSession | null | undefined
) {
  if (load) {
    return 'loading';
  }
  if (sess) {
    return 'authenticated';
  }
  return 'unauthenticated';
}
