import { useQuery } from '@tanstack/react-query';
import { getCaseDetails } from '../services';

export function useCaseDetails(caseId: string | null) {
  return useQuery({
    queryKey: ['cases', 'details', caseId],
    queryFn: ({ signal }) => getCaseDetails(caseId ?? '', signal),
    enabled: caseId !== null,
    retry: false,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });
}
