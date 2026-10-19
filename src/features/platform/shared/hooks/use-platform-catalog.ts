'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { platformService } from '@/lib/api/services/platform.service';
import { useTranslations } from '@/i18n/locale-context';

export function usePlatformMetering(page: number, perPage: number, search: string) {
  return useQuery({
    queryKey: ['platform', 'metering', { page, perPage, search }],
    queryFn: () => platformService.getMetering({ page, perPage, search }),
    placeholderData: keepPreviousData,
  });
}

export function usePlatformSla(page: number, perPage: number, search: string) {
  return useQuery({
    queryKey: ['platform', 'sla', { page, perPage, search }],
    queryFn: () => platformService.getSla({ page, perPage, search }),
    placeholderData: keepPreviousData,
  });
}

export function useTenantHealth(tenantId: string) {
  return useQuery({
    queryKey: ['platform', 'tenants', tenantId, 'health'],
    queryFn: () => platformService.getTenantHealth(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useAdminBilling(adminId: string) {
  return useQuery({
    queryKey: ['platform', 'admins', adminId, 'billing'],
    queryFn: () => platformService.getAdminBilling(adminId),
    enabled: Boolean(adminId),
  });
}

export function useUpdateAdminBilling(adminId: string) {
  const qc = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: (payload: { mode: 'fixed' | 'payg'; package_id?: number }) =>
      platformService.updateAdminBilling(adminId, payload),
    onSuccess: (data) => {
      qc.setQueryData(['platform', 'admins', adminId, 'billing'], data);
      void qc.invalidateQueries({ queryKey: ['platform', 'admins', 'list'] });
      void qc.invalidateQueries({ queryKey: ['platform', 'revenue'] });
      toast.success(
        data.mode === 'payg'
          ? t('platform.catalog.paygSwitched', 'Switched to Pay-As-You-Go')
          : t('platform.catalog.packageSet', 'Package set to {name}', {
              name: data.package?.name ?? t('platform.catalog.selectedPlan', 'the selected plan'),
            }),
      );
    },
  });
}
