import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { EmployeeItem, EmployeeFormData } from '../types';

export function useEmployees() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'employees'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'hr');
      const hrData = data as { employees: EmployeeItem[] };
      return hrData.employees ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: EmployeeFormData) => {
      // Simulate mock mutation delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `emp_${Date.now()}`,
        ...payload,
        joinedAt: new Date().toISOString().split('T')[0]!,
      } as EmployeeItem;
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
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, ...data };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployeeItem[]>(['admin', 'hr', 'employees'], (prev) =>
        prev?.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)) ?? [],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
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
