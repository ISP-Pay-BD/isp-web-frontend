'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { SmsEventConfig, SmsLog, SmsTemplate } from '@/data/admin/comms.data';
import type { Area, Customer, Package } from '@/data/shared/types';

export function useSmsData() {
  return useQuery({
    queryKey: ['admin', 'domain', 'sms'],
    queryFn: async () => {
      const res = await adminService.getSmsData();
      return res as {
        templates: SmsTemplate[];
        events: SmsEventConfig[];
        logs: SmsLog[];
        areas: Area[];
        packages: Package[];
        customers: Customer[];
      };
    },
  });
}
