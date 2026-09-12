import { http } from '../client';
import { mockFetch } from '@/lib/mock-api/client';
import type { AdvanceRequestFormValues } from '@/features/employee/advance-salary/schemas/advance-request.schema';
import type { ProfileUpdateFormValues } from '@/features/employee/profile/schemas/profile.schema';
import {
  employeeProfile,
  employeeSalaries,
  employeeAdvanceRequests,
} from '@/data/employee/salaries.data';

export const employeeService = {
  getSalaries: async () => {
    try {
      const raw = await http.get('/v1/employee/payslips');
      if (raw && typeof raw === 'object' && 'items' in raw) {
        return raw as { items: typeof employeeSalaries; total: number };
      }
      return { items: employeeSalaries, total: employeeSalaries.length };
    } catch {
      return (await mockFetch('employee.salaries.list')) as { items: typeof employeeSalaries; total: number };
    }
  },

  getAdvanceRequests: async () => {
    try {
      const raw = await http.get('/v1/employee/advance-salary');
      if (raw && typeof raw === 'object' && 'items' in raw) {
        return raw as { items: typeof employeeAdvanceRequests; total: number };
      }
      return { items: employeeAdvanceRequests, total: employeeAdvanceRequests.length };
    } catch {
      return (await mockFetch('employee.advance.list')) as { items: typeof employeeAdvanceRequests; total: number };
    }
  },

  requestAdvanceSalary: async (payload: AdvanceRequestFormValues) => {
    try {
      return await http.post('/v1/employee/advance-salary', payload);
    } catch {
      return await mockFetch('employee.advance.request', payload);
    }
  },

  getProfile: async () => {
    try {
      const raw = await http.get<typeof employeeProfile>('/v1/auth/me');
      return raw || employeeProfile;
    } catch {
      return (await mockFetch('employee.profile.get')) as typeof employeeProfile;
    }
  },

  updateProfile: async (payload: ProfileUpdateFormValues) => {
    try {
      return await http.post('/v1/customer/profile/update', payload);
    } catch {
      return await mockFetch('employee.profile.update', payload);
    }
  },
};
