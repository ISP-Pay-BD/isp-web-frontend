'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { SmsEventConfig, SmsLog, SmsTemplate } from '@/data/admin/comms.data';
import type { Area, Customer } from '@/data/shared/types';
import type { Package } from '@/data/shared/types';

export function useSmsData() {
  return useQuery({
    queryKey: ['admin', 'domain', 'sms'],
    queryFn: async () => {
      const [sms, areasRes, packagesRes, customerList] = await Promise.all([
        mockFetch('admin.domain', 'sms'),
        mockFetch('admin.domain', 'areas'),
        mockFetch('admin.domain', 'packages'),
        mockFetch('admin.customers.list'),
      ]);
      const smsData = sms as {
        templates: SmsTemplate[];
        events: SmsEventConfig[];
        logs: SmsLog[];
      };
      const areas = (areasRes as { items?: Area[] }).items ?? [];
      const packages = (packagesRes as { items?: Package[] }).items ?? [];
      const customers = (customerList as { items?: Customer[] }).items ?? [];
      return {
        ...smsData,
        areas,
        packages,
        customers,
      };
    },
  });
}
