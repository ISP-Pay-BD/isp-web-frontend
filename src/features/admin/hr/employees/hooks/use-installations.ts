'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hrService } from '@/lib/api/services/employee.service';
import { hrKeys } from '../../shared/keys';
import { mapCustomerOption, mapInstallation } from './mappers';

export interface InstallationListParams {
  employeeId?: string;
  status: string;
  page: number;
  perPage: number;
}

export function useInstallations(params: InstallationListParams) {
  return useQuery({
    queryKey: [...hrKeys.installations, params],
    queryFn: async () => {
      const res = await hrService.listInstallations({
        employee_id: params.employeeId || undefined,
        status: params.status !== 'all' ? params.status : undefined,
        page: params.page,
        per_page: params.perPage,
      });
      return { items: res.items.map(mapInstallation), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Customer picker for a new work order (server-side search, max 20). */
export function useInstallationCustomers(search: string, enabled: boolean) {
  return useQuery({
    queryKey: [...hrKeys.installations, 'customers', search],
    queryFn: async () => {
      const rows = await hrService.searchInstallationCustomers(search);
      return (Array.isArray(rows) ? rows : []).map(mapCustomerOption);
    },
    enabled,
    staleTime: 30_000,
  });
}

export interface InstallationInput {
  title: string;
  customerId?: string;
  assignedEmployeeId?: string;
  address: string;
  latitude?: string;
  longitude?: string;
  scheduledAt?: string;
  notes?: string;
}

function toBody(v: InstallationInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: v.title.trim(),
    address: v.address.trim(),
    notes: v.notes?.trim() ?? '',
  };
  if (v.customerId) body.customer_id = Number(v.customerId);
  if (v.assignedEmployeeId) body.assigned_employee_id = Number(v.assignedEmployeeId);
  if (v.scheduledAt) body.scheduled_at = v.scheduledAt;
  if (v.latitude && v.longitude) {
    body.latitude = Number(v.latitude);
    body.longitude = Number(v.longitude);
  }
  return body;
}

export function useInstallationMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: hrKeys.installations });

  const create = useMutation({
    mutationFn: (v: InstallationInput) => hrService.createInstallation(toBody(v)),
    meta: { silent: true },
    onSuccess: refresh,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => hrService.updateInstallation(id, { status: 'cancelled' }),
    onSuccess: refresh,
  });

  return { create, cancel };
}
