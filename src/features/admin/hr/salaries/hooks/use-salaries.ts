import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { mockFetch } from '@/lib/mock-api/client';
import type { SalaryPaymentItem, SalaryPaymentFormData } from '../types';
import { mockDelay } from '@/lib/mock-api/delay';

export function useSalaries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'salaries'],
    queryFn: async () => {
      try {
        const empRes = await adminService.getEmployees();
        const rawEmps = empRes && typeof empRes === 'object' && 'employees' in empRes && Array.isArray(empRes.employees)
          ? (empRes.employees as { id: string; name: string; salaryBdt: number }[])
          : [];

        if (rawEmps.length > 0) {
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
        }

        const data = await mockFetch('admin.domain', 'hr');
        const hrData = data as { salaryPayments: SalaryPaymentItem[]; employees: { id: string; name: string; salaryBdt: number }[] };
        return {
          salaryPayments: hrData.salaryPayments ?? [],
          employees: hrData.employees ?? [],
        };
      } catch {
        const data = await mockFetch('admin.domain', 'hr');
        const hrData = data as { salaryPayments: SalaryPaymentItem[]; employees: { id: string; name: string; salaryBdt: number }[] };
        return {
          salaryPayments: hrData.salaryPayments ?? [],
          employees: hrData.employees ?? [],
        };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: SalaryPaymentFormData & { employeeName: string }) => {
      await mockDelay(30);
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
