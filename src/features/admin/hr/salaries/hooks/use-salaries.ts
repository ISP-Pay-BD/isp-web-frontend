import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { SalaryPaymentItem, SalaryPaymentFormData } from '../types';

export function useSalaries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'salaries'],
    queryFn: async () => {
      const empRes = await adminService.getEmployees();
      const rawEmps = empRes && typeof empRes === 'object' && 'employees' in empRes && Array.isArray(empRes.employees)
        ? (empRes.employees as { id: string; name: string; salaryBdt: number }[])
        : [];

      const payments: SalaryPaymentItem[] = rawEmps.map((emp, idx) => ({
        id: `sal_${emp.id}_${idx}`,
        employeeId: emp.id,
        employeeName: emp.name,
        amountBdt: emp.salaryBdt || 25000,
        month: '2026-02',
        paidAt: '2026-02-28',
        paidVia: idx % 2 === 0 ? 'Bank Transfer' : 'bKash',
        status: 'paid' as const,
      }));

      return {
        salaryPayments: payments,
        employees: rawEmps,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: SalaryPaymentFormData & { employeeName: string }) => {
      const resellerId = (await import('@/lib/api/auth-utils')).getAuthUserId();
      await import('@/lib/api/client').then((m) =>
        m.http.post(`/v1/reseller/employee-payments/${resellerId}`, {
          employee_id: payload.employeeId,
          amount: payload.amountBdt,
          month: payload.month,
          method: payload.paidVia,
        }),
      );
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
