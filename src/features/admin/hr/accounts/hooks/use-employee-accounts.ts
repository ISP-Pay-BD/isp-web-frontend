import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { EmployeeAccountItem } from '../types';

export function useEmployeeAccounts() {
  const query = useQuery({
    queryKey: ['admin', 'hr', 'accounts'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'hr');
      const hrData = data as { employeeAccounts: EmployeeAccountItem[]; employees: { id: string; name: string; role: string; salaryBdt: number }[] };
      return {
        accounts: hrData.employeeAccounts ?? [],
        employees: hrData.employees ?? [],
      };
    },
  });

  return {
    ...query,
    accounts: query.data?.accounts ?? [],
    employees: query.data?.employees ?? [],
  };
}
