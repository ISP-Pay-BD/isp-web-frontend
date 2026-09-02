import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { AdvanceSalaryItem, GrantAdvanceFormData } from '../types';

export function useAdvanceSalary() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'advance-salary'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'hr');
      const hrData = data as { advanceSalaryRequests: AdvanceSalaryItem[]; employees: { id: string; name: string }[] };
      return {
        requests: hrData.advanceSalaryRequests ?? [],
        employees: hrData.employees ?? [],
      };
    },
  });

  const grantMutation = useMutation({
    mutationFn: async (payload: GrantAdvanceFormData & { employeeName: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `adv_${Date.now()}`,
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        amountBdt: payload.amountBdt,
        reason: payload.reason,
        status: 'approved' as const,
        requestedAt: new Date().toISOString().split('T')[0]!,
        deductMonth: payload.deductMonth,
      };
    },
    onSuccess: (newAdv) => {
      queryClient.setQueryData<{ requests: AdvanceSalaryItem[]; employees: { id: string; name: string }[] }>(
        ['admin', 'hr', 'advance-salary'],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            requests: [newAdv, ...prev.requests],
          };
        },
      );
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdvanceSalaryItem['status'] }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, status };
    },
    onSuccess: ({ id, status }) => {
      queryClient.setQueryData<{ requests: AdvanceSalaryItem[]; employees: { id: string; name: string }[] }>(
        ['admin', 'hr', 'advance-salary'],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            requests: prev.requests.map((r) => (r.id === id ? { ...r, status } : r)),
          };
        },
      );
    },
  });

  return {
    ...query,
    requests: query.data?.requests ?? [],
    employees: query.data?.employees ?? [],
    grantAdvance: grantMutation.mutateAsync,
    isGranting: grantMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
  };
}
