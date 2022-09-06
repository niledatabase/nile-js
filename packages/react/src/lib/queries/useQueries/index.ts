import {
  useQueries as reactUseQueries,
  QueriesResults,
  UseQueryOptions,
  QueriesOptions,
} from '@tanstack/react-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQueries<T extends any[]>({
  queries,
  context,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - our TS does not like this
  queries: readonly [...QueriesOptions<T>];
  context?: UseQueryOptions['context'];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - our TS does not like this
}): QueriesResults<T> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - in react-query, a helper function fixes the type
  return reactUseQueries(queries, context);
}
