/**
 * A wrapper function for `fetch`, to be sure credentials are included in the request
 * This is necessary for a client requestion from 2 or more backend services
 * @returns A promise
 */
export default function useFetch() {
  return (input: RequestInfo | string, init?: RequestInit): Promise<Response> =>
    fetch(input, { ...init, credentials: 'include' });
}
