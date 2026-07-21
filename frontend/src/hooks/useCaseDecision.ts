import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitCaseDecision } from '../services';
import type { SubmitCaseDecisionRequest } from '../types';

export function useCaseDecision(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitCaseDecisionRequest) =>
      submitCaseDecision(caseId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
}
