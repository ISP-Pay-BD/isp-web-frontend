import type { TenantPortal } from '@/data/platform/tenants.data';
import type { PlatformContact } from '@/data/platform/contacts.data';

export interface PlatformDashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrrBdt: number;
  arrBdt: number;
  growthPercentage: number;
  openTickets: number;
  recentContacts: PlatformContact[];
  topTenants: TenantPortal[];
  chartData: { month: string; revenue: number; tenants: number }[];
}
