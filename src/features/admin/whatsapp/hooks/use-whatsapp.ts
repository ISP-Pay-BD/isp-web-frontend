import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
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
      try {
        const [tplRes, sessRes] = await Promise.allSettled([
          adminService.getWhatsAppTemplates(),
          adminService.getWhatsAppSessions(),
        ]);

        const rawTemplates = tplRes.status === 'fulfilled' && Array.isArray(tplRes.value) ? (tplRes.value as WhatsAppTemplate[]) : [];
        const fallback = (await mockFetch('admin.domain', 'whatsapp')) as {
          conversations: WhatsAppConversation[];
          templates: WhatsAppTemplate[];
          logs: WhatsAppMessageLog[];
          optIns: WhatsAppOptIn[];
          campaigns: WhatsAppCampaign[];
          settings: WhatsAppSettingsConfig;
        };

        return {
          ...fallback,
          templates: rawTemplates.length > 0 ? rawTemplates : fallback.templates,
        };
      } catch {
        const res = await mockFetch('admin.domain', 'whatsapp');
        return res as {
          conversations: WhatsAppConversation[];
          templates: WhatsAppTemplate[];
          logs: WhatsAppMessageLog[];
          optIns: WhatsAppOptIn[];
          campaigns: WhatsAppCampaign[];
          settings: WhatsAppSettingsConfig;
        };
      }
    },
  });
}

