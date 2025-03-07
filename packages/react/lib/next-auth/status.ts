import { Session } from 'next-auth';

export function getStatus(load: boolean, sess: Session | null | undefined) {
  if (load) {
    return 'loading';
  }
  if (sess) {
    return 'authenticated';
  }
  return 'unauthenticated';
}
