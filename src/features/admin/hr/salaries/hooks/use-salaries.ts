import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { SalaryPaymentItem, SalaryPaymentFormData } from '../types';

export function useSalaries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'salaries'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'hr');
      const hrData = data as { salaryPayments: SalaryPaymentItem[]; employees: { id: string; name: string; salaryBdt: number }[] };
      return {
        salaryPayments: hrData.salaryPayments ?? [],
        employees: hrData.employees ?? [],
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: SalaryPaymentFormData & { employeeName: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `sal_${Date.now()}`,
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        amountBdt: payload.amountBdt,
        month: payload.month,
        paidAt: new Date().toISOString().split('T')[0]!,
        paidVia: payload.paidVia,
        status: 'paid' as const,
      };
    },
    onSuccess: (newPayment) => {
      queryClient.setQueryData<{ salaryPayments: SalaryPaymentItem[]; employees: { id: string; name: string }[] }>(
        ['admin', 'hr', 'salaries'],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            salaryPayments: [newPayment, ...prev.salaryPayments],
          };
        },
      );
    },
  });

  return {
    ...query,
    salaryPayments: query.data?.salaryPayments ?? [],
    employees: query.data?.employees ?? [],
    recordPayment: createMutation.mutateAsync,
    isRecording: createMutation.isPending,
  };
}
