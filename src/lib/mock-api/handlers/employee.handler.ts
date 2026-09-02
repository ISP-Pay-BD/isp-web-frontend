import { mockDelay } from '../delay';
import {
  employeeProfile,
  employeeSalaries,
  employeeAdvanceRequests,
} from '@/data/employee/salaries.data';

export async function getEmployeeSalaries() {
  await mockDelay();
  return { items: employeeSalaries, total: employeeSalaries.length };
}

export async function getEmployeeAdvanceRequests() {
  await mockDelay();
  return { items: employeeAdvanceRequests, total: employeeAdvanceRequests.length };
}

export async function getEmployeeProfile() {
  await mockDelay();
  return employeeProfile;
}

export interface AdvanceRequestPayload {
  amountBdt: number;
  reason: string;
}

export async function requestAdvanceSalary(payload: AdvanceRequestPayload) {
  await mockDelay(400);
  return {
    id: `adv_${Date.now()}`,
    amountBdt: payload.amountBdt,
    reason: payload.reason,
    status: 'pending' as const,
    requestedAt: new Date().toISOString().slice(0, 10),
  };
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  email?: string;
}

export async function updateEmployeeProfile(payload: ProfileUpdatePayload) {
  await mockDelay(400);
  return { ...employeeProfile, ...payload };
}
