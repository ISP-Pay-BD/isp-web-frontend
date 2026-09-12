'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type CustomerListParams } from '@/lib/api/services/admin.service';
import { mockFetch } from '@/lib/mock-api/client';
import { toast } from 'sonner';
import type { Customer } from '../types';

export function useCustomers(params?: CustomerListParams) {
  return useQuery({
    queryKey: ['admin', 'customers', 'list', params],
    queryFn: () => adminService.getCustomers(params),
  });
}

export function useExpiredCustomers() {
  return useQuery({
    queryKey: ['admin', 'customers', 'expired'],
    queryFn: () => adminService.getExpiredCustomers(),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: () => adminService.getCustomerById(id),
    enabled: Boolean(id),
  });
}

export function useFreeRequests() {
  return useQuery({
    queryKey: ['admin', 'domain', 'freeRequests'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'freeRequests');
      return Array.isArray(res) ? res : [];
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Customer>) => adminService.createCustomer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Customer created successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create customer');
    },
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Customer>) => adminService.updateCustomer(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'customers', id] });
      toast.success('Customer details updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update customer');
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Customer deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete customer');
    },
  });
}
