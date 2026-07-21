import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCase } from '../services';

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCase,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });
}
