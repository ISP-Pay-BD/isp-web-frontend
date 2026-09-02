'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { VoiceBroadcast, VoiceMessage } from '@/data/admin/voice-sms.data';

export function useVoiceSms() {
  return useQuery({
    queryKey: ['admin', 'domain', 'voiceSms'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'voiceSms');
      return res as {
        gateways: string[];
        messages: VoiceMessage[];
        broadcasts: VoiceBroadcast[];
      };
    },
  });
}
