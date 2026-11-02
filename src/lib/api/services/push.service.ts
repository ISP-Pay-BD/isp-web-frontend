import { http } from '../client';

export interface DeviceTokenPayload {
  token: string;
  device_type?: string;
  app_version?: string;
}

export interface PushStatus {
  total_devices: number;
  android_devices: number;
  ios_devices: number;
  web_devices: number;
  active_tenants: number;
}

export interface PushRecipientCount {
  audience: string;
  count: number;
}

export interface PushTenant {
  tenant_id: number;
  company_name: string;
  device_count: number;
}

export interface PushCampaign {
  id: number;
  admin_id: number;
  title: string;
  body: string;
  image_url: string | null;
  action_url: string | null;
  audience_type: string;
  tenant_id: number | null;
  data_payload: string | null;
  total_targets: number;
  successful_deliveries: number;
  failed_deliveries: number;
  status: string;
  sent_at: string | null;
  created_at: string | null;
}

export interface CreateCampaignPayload {
  title: string;
  body: string;
  audience_type?: 'all' | 'customers' | 'resellers' | 'employees' | 'tenant';
  tenant_id?: number;
  image_url?: string;
  action_url?: string;
  data?: Record<string, unknown>;
}

export interface TestPushPayload {
  title: string;
  body: string;
}

export const pushService = {
  // ── Device Token Registration ──────────────────────────────────────────
  registerToken: async (payload: DeviceTokenPayload): Promise<{ success: boolean; message: string }> => {
    return await http.post<{ success: boolean; message: string }>('/v1/devices/push-token', payload);
  },

  unregisterToken: async (token: string): Promise<{ success: boolean; message: string }> => {
    return await http.delete<{ success: boolean; message: string }>('/v1/devices/push-token', { token });
  },

  // ── Admin Push Management ──────────────────────────────────────────────
  getStatus: async (): Promise<PushStatus> => {
    return await http.get<PushStatus>('/v1/push/status');
  },

  getRecipients: async (audience?: string): Promise<PushRecipientCount> => {
    return await http.get<PushRecipientCount>('/v1/push/recipients', audience ? { audience } : undefined);
  },

  getTenants: async (): Promise<PushTenant[]> => {
    return await http.get<PushTenant[]>('/v1/push/tenants');
  },

  getCampaigns: async (page = 1, limit = 20): Promise<PushCampaign[]> => {
    return await http.get<PushCampaign[]>('/v1/push/campaigns', { page, limit });
  },

  getCampaign: async (id: number | string): Promise<PushCampaign> => {
    return await http.get<PushCampaign>(`/v1/push/campaigns/${id}`);
  },

  sendCampaign: async (payload: CreateCampaignPayload): Promise<PushCampaign> => {
    return await http.post<PushCampaign>('/v1/push/campaigns', payload);
  },

  sendTestPush: async (payload: TestPushPayload): Promise<{ success: boolean; message: string }> => {
    return await http.post<{ success: boolean; message: string }>('/v1/push/test', payload);
  },
};
