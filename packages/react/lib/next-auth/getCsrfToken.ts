import { fetchData, FetchInit } from './fetchData';
import logger from './logger';
import { __NEXTAUTH } from './process';

/**
 * Returns the current Cross Site Request Forgery Token (CSRF Token)
 * required to make POST requests (e.g. for signing in and signing out).
 * You likely only need to use this if you are not using the built-in
 * `signIn()` and `signOut()` methods.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#getcsrftoken)
 */
export async function getCsrfToken(params?: FetchInit) {
  const response = await fetchData<{ csrfToken: string }>(
    'csrf',
    __NEXTAUTH,
    logger,
    params
  );
  return response?.csrfToken;
}
