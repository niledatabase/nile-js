import React from 'react';

import { useNile } from '../../../context';

/**
 * A function to handle removing the `state` query param on login, in exchange for a cookie that can be used for authentication
 * @returns an error, if there is one
 */
export const useVerifyToken = (): [boolean, null | string] => {
  const nile = useNile();
  const [token, setToken] = React.useState<null | string>(null);
  const [error, setError] = React.useState<null | string>(null);
  const [success, setSuccess] = React.useState(false);
  const url = React.useMemo(() => {
    return new URL(window.location.href);
  }, []);

  React.useEffect(() => {
    setError(null);
    const state = url.searchParams.get('state');
    if (state) {
      setToken(state);
    }
  }, [url.searchParams]);

  React.useEffect(() => {
    url.searchParams.delete('state');
    window.history.pushState(
      { path: url.pathname },
      document.title,
      url.toString()
    );
    async function doRequest() {
      setError(null);
      if (token) {
        try {
          await fetch(
            `${nile.config?.basePath}/auth/oidc/verify?state=${token}`
          );
          setSuccess(true);
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          }
        }
      }
    }
    doRequest();
  }, [nile.config?.basePath, token, url]);

  return [success, error];
};
