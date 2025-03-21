const queryMaker = (key: string, url: string, params?: QueryBuilderParams) => {
  const { baseUrl = '', fetchUrl, disableQuery, init } = params ?? {};
  return {
    queryKey: [key, baseUrl],
    queryFn: async () => {
      await fetch(fetchUrl ?? `${baseUrl}/api/${url}`, init);
    },
    enabled: disableQuery === true,
  };
};

export const buildProvidersQuery = (params?: QueryBuilderParams) =>
  queryMaker('providers', 'auth/providers', params);

export const buildCsrfQuery = (params?: QueryBuilderParams) =>
  queryMaker('csrf', 'auth/csrf', params);

export type QueryBuilderParams = {
  baseUrl?: string;
  disableQuery?: boolean;
  init?: RequestInit;
  fetchUrl?: string;
};
