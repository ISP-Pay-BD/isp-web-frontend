'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type {
  WhatsAppCampaign,
  WhatsAppConversation,
  WhatsAppMessageLog,
  WhatsAppOptIn,
  WhatsAppSettingsConfig,
  WhatsAppTemplate,
} from '@/data/admin/comms.data';

export function useWhatsApp() {
  return useQuery({
    queryKey: ['admin', 'domain', 'whatsapp'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'whatsapp');
      return res as {
        conversations: WhatsAppConversation[];
        templates: WhatsAppTemplate[];
        logs: WhatsAppMessageLog[];
        optIns: WhatsAppOptIn[];
        campaigns: WhatsAppCampaign[];
        settings: WhatsAppSettingsConfig;
      };
    },
  });
}
