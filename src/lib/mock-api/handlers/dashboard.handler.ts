import { mockDelay } from '../delay';
import { adminDashboardStats, customerDashboardStats } from '@/data/admin/dashboard.data';

export async function getAdminDashboard() {
  await mockDelay();
  return adminDashboardStats;
}

export async function getCustomerDashboard() {
  await mockDelay();
  return customerDashboardStats;
}
