import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
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
      const [tplRes, sessRes] = await Promise.allSettled([
        adminService.getWhatsAppTemplates(),
        adminService.getWhatsAppSessions(),
      ]);

      const rawTemplates = tplRes.status === 'fulfilled' && Array.isArray(tplRes.value) ? (tplRes.value as WhatsAppTemplate[]) : [];
      const rawSessions = sessRes.status === 'fulfilled' && sessRes.value ? sessRes.value : {};

      const sessions = rawSessions as Record<string, unknown>;
      const conversations = Array.isArray(sessions.conversations) ? (sessions.conversations as WhatsAppConversation[]) : [];
      const logs = Array.isArray(sessions.logs) ? (sessions.logs as WhatsAppMessageLog[]) : [];
      const optIns = Array.isArray(sessions.optIns) ? (sessions.optIns as WhatsAppOptIn[]) : [];
      const campaigns = Array.isArray(sessions.campaigns) ? (sessions.campaigns as WhatsAppCampaign[]) : [];
      const settings = (sessions.settings ?? {}) as WhatsAppSettingsConfig;

      return {
        conversations,
        templates: rawTemplates,
        logs,
        optIns,
        campaigns,
        settings,
      };
    },
  });
}
