import { http } from '../client';

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read: boolean;
  type?: string;
  created_at: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await http.get<UnreadCountResponse>('/v1/notifications/unread-count');
      return res.count ?? 0;
    } catch {
      return 0;
    }
  },

  getNotifications: async (page = 1, limit = 20): Promise<AppNotification[]> => {
    try {
      const res = await http.get<any>('/v1/notifications', { page, limit });
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.notifications)) return res.notifications;
      if (Array.isArray(res?.items)) return res.items;
      return [];
    } catch {
      return [];
    }
  },

  markAsRead: async (id: number | string): Promise<{ success: boolean; message?: string }> => {
    return await http.post<{ success: boolean; message?: string }>(`/v1/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<{ success: boolean; message?: string }> => {
    return await http.post<{ success: boolean; message?: string }>('/v1/notifications/read-all');
  },
};
