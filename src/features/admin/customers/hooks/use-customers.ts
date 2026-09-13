'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type CustomerListParams } from '@/lib/api/services/admin.service';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
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

export function useCustomerOptical(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', id, 'optical'],
    queryFn: () => adminService.getCustomerOptical(id),
    enabled: Boolean(id),
  });
}

export function useCustomerSession(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', id, 'session'],
    queryFn: () => adminService.getCustomerSession(id),
    enabled: Boolean(id),
    refetchInterval: 15000,
  });
}

export function useCustomerUsage(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', id, 'usage'],
    queryFn: () => adminService.getCustomerUsage(id),
    enabled: Boolean(id),
  });
}

export function useCustomerPayments(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', id, 'payments'],
    queryFn: () => adminService.getUserPayments(id),
    enabled: Boolean(id),
  });
}

export function useFreeRequests() {
  return useQuery({
    queryKey: ['admin', 'domain', 'freeRequests'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const res = await http.get<unknown>(`/v1/reseller/customers/${resellerId}`, { status: 'free' });
      if (Array.isArray(res)) return res;
      if (res && typeof res === 'object' && 'data' in res) return (res as { data: unknown[] }).data;
      return [];
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
