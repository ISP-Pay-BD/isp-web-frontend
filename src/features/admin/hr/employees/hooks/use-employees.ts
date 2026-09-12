import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { EmployeeItem, EmployeeFormData } from '../types';

export function useEmployees() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'employees'],
    queryFn: async () => {
      const data = await adminService.getEmployees();
      return (data.employees as EmployeeItem[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: EmployeeFormData) => {
      const res = await adminService.createEmployee(payload as unknown as Record<string, unknown>);
      return res as EmployeeItem;
    },
    onSuccess: (newEmp) => {
      queryClient.setQueryData<EmployeeItem[]>(['admin', 'hr', 'employees'], (prev) => [
        newEmp,
        ...(prev ?? []),
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      const res = await adminService.updateEmployee(id, data);
      return res as { id: string } & Partial<EmployeeFormData>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployeeItem[]>(['admin', 'hr', 'employees'], (prev) =>
        prev?.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)) ?? [],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminService.deleteEmployee(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<EmployeeItem[]>(['admin', 'hr', 'employees'], (prev) =>
        prev?.filter((item) => item.id !== deletedId) ?? [],
      );
    },
  });

  return {
    ...query,
    employees: query.data ?? [],
    createEmployee: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateEmployee: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteEmployee: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
