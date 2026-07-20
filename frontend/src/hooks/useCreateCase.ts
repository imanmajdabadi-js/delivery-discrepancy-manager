import { useMutation } from '@tanstack/react-query';
import { createCase } from '../services';

export function useCreateCase() {
  return useMutation({ mutationFn: createCase });
}
