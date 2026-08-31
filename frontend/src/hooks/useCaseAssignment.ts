import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimCase, releaseCase } from '../services';

export function useCaseAssignment(caseId: string) {
  const queryClient = useQueryClient();

  const claim = useMutation({
    mutationFn: () => claimCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', 'details', caseId] });
    },
  });

  const release = useMutation({
    mutationFn: () => releaseCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', 'details', caseId] });
    },
  });

  return { claim, release };
}
