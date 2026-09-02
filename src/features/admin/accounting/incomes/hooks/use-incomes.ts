import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { IncomeItem } from '../types';
import type { IncomeFormValues } from '../schemas';

export function useIncomes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'accounting', 'incomes'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'accounting');
      const accData = data as { incomes: IncomeItem[] };
      return accData.incomes ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: IncomeFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `inc_${Date.now()}`,
        date: payload.date,
        category: payload.category,
        amountBdt: payload.amountBdt,
        method: payload.method,
        note: payload.note,
        bankAccount: payload.bankAccount,
      } as IncomeItem;
    },
    onSuccess: (newInc) => {
      queryClient.setQueryData<IncomeItem[]>(['admin', 'accounting', 'incomes'], (prev) => [
        newInc,
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
      queryClient.setQueryData<IncomeItem[]>(['admin', 'accounting', 'incomes'], (prev) =>
        prev?.filter((item) => item.id !== deletedId) ?? [],
      );
    },
  });

  return {
    ...query,
    incomes: query.data ?? [],
    createIncome: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteIncome: deleteMutation.mutateAsync,
  };
}
