'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { VoiceBroadcast, VoiceMessage } from '@/data/admin/voice-sms.data';

export function useVoiceSms() {
  return useQuery({
    queryKey: ['admin', 'domain', 'voiceSms'],
    queryFn: async () => {
      try {
        const res = await adminService.getVoiceSmsData();
        return {
          gateways: ['bKash Voice', 'Nagad Voice'],
          messages: [] as VoiceMessage[],
          broadcasts: Array.isArray(res) ? (res as VoiceBroadcast[]) : [],
        };
      } catch {
        return {
          gateways: [],
          messages: [],
          broadcasts: [],
        };
      }
    },
  });
}

