import { useContext } from 'react';
import { QueryClient, QueryClientContext } from '@tanstack/react-query';

const fallbackQueryClient = new QueryClient();

export function useQueryClientOrDefault(client?: QueryClient): QueryClient {
  const contextClient = useContext(QueryClientContext);
  return client ?? contextClient ?? fallbackQueryClient;
}
