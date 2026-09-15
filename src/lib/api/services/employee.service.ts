import { http } from '../client';
import type { AdvanceRequestFormValues } from '@/features/employee/advance-salary/schemas/advance-request.schema';
import type { ProfileUpdateFormValues } from '@/features/employee/profile/schemas/profile.schema';
import type { EmployeeProfile, EmployeeSalary, EmployeeAdvanceRequest } from '@/features/employee/shared/types';
import { getAuthUserId } from '../auth-utils';

export const employeeService = {
  getSalaries: async (resellerId?: string | number): Promise<{ items: EmployeeSalary[]; total: number }> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/employee-payments/${finalId}`);
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { items: (raw as { data: EmployeeSalary[] }).data, total: (raw as { data: unknown[] }).data.length };
    }
    if (Array.isArray(raw)) {
      return { items: raw as EmployeeSalary[], total: raw.length };
    }
    return { items: [], total: 0 };
  },

  getAdvanceRequests: async (resellerId?: string | number): Promise<{ items: EmployeeAdvanceRequest[]; total: number }> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/employees/${finalId}/advance-salary`);
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { items: (raw as { data: EmployeeAdvanceRequest[] }).data, total: (raw as { data: unknown[] }).data.length };
    }
    if (Array.isArray(raw)) {
      return { items: raw as EmployeeAdvanceRequest[], total: raw.length };
    }
    return { items: [], total: 0 };
  },

  requestAdvanceSalary: async (payload: AdvanceRequestFormValues, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}/advance-salary`, payload);
  },

  getProfile: async (): Promise<EmployeeProfile> => {
    const raw = await http.get<Record<string, unknown>>('/v1/auth/me');
    const details = (raw.details || raw.user || raw) as Record<string, unknown>;
    return {
      id: String(details.id ?? ''),
      name: String(details.name ?? details.full_name ?? ''),
      email: String(details.email ?? ''),
      phone: String(details.phone ?? details.mobile ?? ''),
      department: String(details.department ?? ''),
      role: String(details.role ?? details.user_role ?? details.designation ?? ''),
      manager: String(details.manager ?? details.reporting_manager ?? ''),
      joinedAt: String(details.created_at ?? details.joined_at ?? ''),
    };
  },

  updateProfile: async (payload: ProfileUpdateFormValues) => {
    return await http.post('/v1/customer/profile/update', payload);
  },

  getAttendanceHistory: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/employees/${finalId}/attendance`);
  },

  punchCheckIn: async (payload?: { latitude?: number; longitude?: number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}/attendance/check-in`, payload);
  },

  punchCheckOut: async (payload?: { latitude?: number; longitude?: number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}/attendance/check-out`, payload);
  },

  updateLocation: async (payload: { latitude: number; longitude: number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}/attendance/location`, payload);
  },
};
