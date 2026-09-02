import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { ExpenseItem } from '../types';
import type { ExpenseFormValues } from '../schemas';

export function useExpenses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'accounting', 'expenses'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'accounting');
      const accData = data as { expenses: ExpenseItem[] };
      return accData.expenses ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ExpenseFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `exp_${Date.now()}`,
        date: payload.date,
        category: payload.category,
        amountBdt: payload.amountBdt,
        vendor: payload.vendor,
        note: payload.note,
      } as ExpenseItem;
    },
    onSuccess: (newExp) => {
      queryClient.setQueryData<ExpenseItem[]>(['admin', 'accounting', 'expenses'], (prev) => [
        newExp,
        ...(prev ?? []),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<ExpenseItem[]>(['admin', 'accounting', 'expenses'], (prev) =>
        prev?.filter((item) => item.id !== deletedId) ?? [],
      );
    },
  });

  return {
    ...query,
    expenses: query.data ?? [],
    createExpense: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteExpense: deleteMutation.mutateAsync,
  };
}
