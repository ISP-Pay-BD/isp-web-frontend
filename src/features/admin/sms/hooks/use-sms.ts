'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { SmsEventConfig, SmsLog, SmsTemplate } from '@/data/admin/comms.data';

export function useSmsData() {
  return useQuery({
    queryKey: ['admin', 'domain', 'sms'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'sms');
      return res as {
        templates: SmsTemplate[];
        events: SmsEventConfig[];
        logs: SmsLog[];
      };
    },
  });
}
