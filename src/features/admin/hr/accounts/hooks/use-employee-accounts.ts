import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { mockFetch } from '@/lib/mock-api/client';
import type { EmployeeAccountItem } from '../types';

export function useEmployeeAccounts() {
  const query = useQuery({
    queryKey: ['admin', 'hr', 'accounts'],
    queryFn: async () => {
      try {
        const empRes = await adminService.getEmployees();
        const rawEmps = empRes && typeof empRes === 'object' && 'employees' in empRes && Array.isArray(empRes.employees)
          ? (empRes.employees as { id: string; name: string; role: string; salaryBdt: number }[])
          : [];

        if (rawEmps.length > 0) {
          const accounts: EmployeeAccountItem[] = rawEmps.map((emp) => ({
            employeeId: emp.id,
            employeeName: emp.name,
            balanceBdt: 0,
            advancesBdt: 0,
            lastSalaryMonth: '2026-02',
          }));

          return {
            accounts,
            employees: rawEmps,
          };
        }

        const data = await mockFetch('admin.domain', 'hr');
        const hrData = data as { employeeAccounts: EmployeeAccountItem[]; employees: { id: string; name: string; role: string; salaryBdt: number }[] };
        return {
          accounts: hrData.employeeAccounts ?? [],
          employees: hrData.employees ?? [],
        };
      } catch {
        const data = await mockFetch('admin.domain', 'hr');
        const hrData = data as { employeeAccounts: EmployeeAccountItem[]; employees: { id: string; name: string; role: string; salaryBdt: number }[] };
        return {
          accounts: hrData.employeeAccounts ?? [],
          employees: hrData.employees ?? [],
        };
      }
    },
  });

  return {
    ...query,
    accounts: query.data?.accounts ?? [],
    employees: query.data?.employees ?? [],
  };
}
