import { useQuery } from '@tanstack/react-query';
import { getCases } from '../services';
import type { CaseStatus } from '../types';

export function useCases(query: string, status: CaseStatus | null) {
  return useQuery({
    queryKey: ['cases', query, status],
    queryFn: ({ signal }) => getCases(query, status, signal),
    retry: false,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });
}
