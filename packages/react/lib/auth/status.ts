import { AuthSession } from './Authorizer';

export function getStatus(load: boolean, sess: AuthSession | null | undefined) {
  if (load) {
    return 'loading';
  }
  if (sess) {
    return 'authenticated';
  }
  return 'unauthenticated';
}
