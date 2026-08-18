import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimCase, releaseCase } from '../services';

export function useCaseAssignment() {
  const queryClient = useQueryClient();

  const claim = useMutation({
    mutationFn: claimCase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });

  const release = useMutation({
    mutationFn: releaseCase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });

  return { claim, release };
}
