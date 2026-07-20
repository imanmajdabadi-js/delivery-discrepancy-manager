import { useQuery } from '@tanstack/react-query';
import { searchOrders } from '../services';

export function useOrderSearch(query: string | null) {
  return useQuery({
    queryKey: ['orders', 'search', query],
    queryFn: ({ signal }) => searchOrders(query ?? '', signal),
    enabled: query !== null,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
