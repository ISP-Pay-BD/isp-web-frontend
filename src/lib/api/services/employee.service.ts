import { http } from '../client';
import type { AdvanceRequestFormValues } from '@/features/employee/advance-salary/schemas/advance-request.schema';
import type { ProfileUpdateFormValues } from '@/features/employee/profile/schemas/profile.schema';
import {
  employeeProfile,
  employeeSalaries,
  employeeAdvanceRequests,
} from '@/data/employee/salaries.data';
import { getAuthUserId } from '../auth-utils';

export const employeeService = {
  getSalaries: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/employee-payments/${finalId}`);
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { items: (raw as { data: typeof employeeSalaries }).data, total: (raw as { data: unknown[] }).data.length };
    }
    if (Array.isArray(raw)) {
      return { items: raw as typeof employeeSalaries, total: raw.length };
    }
    return { items: [], total: 0 };
  },

  getAdvanceRequests: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/employees/${finalId}/advance-salary`);
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { items: (raw as { data: typeof employeeAdvanceRequests }).data, total: (raw as { data: unknown[] }).data.length };
    }
    if (Array.isArray(raw)) {
      return { items: raw as typeof employeeAdvanceRequests, total: raw.length };
    }
    return { items: [], total: 0 };
  },

  requestAdvanceSalary: async (payload: AdvanceRequestFormValues, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}/advance-salary`, payload);
  },

  getProfile: async () => {
    const raw = await http.get<typeof employeeProfile>('/v1/auth/me');
    return raw || employeeProfile;
  },

  updateProfile: async (payload: ProfileUpdateFormValues) => {
    return await http.post('/v1/customer/profile/update', payload);
  },
};
