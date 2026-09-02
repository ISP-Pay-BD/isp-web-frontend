import { mockDelay } from '../delay';
import {
  tenants,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantById,
  platformRevenue,
  type TenantPortal,
} from '@/data/platform/tenants.data';
import {
  platformContacts,
  platformAdmins,
  adminPackages,
  platformSupportTickets,
  platformFileManager,
  productShowcase,
  platformSettings,
  systemLogs,
  type PlatformContact,
  type PlatformSoftwareSettings,
} from '@/data/platform/contacts.data';
import { pluginsMarketplaceFull } from '@/data/marketing/plugins.data';
import { userAccessRoles } from '@/data/admin/network-ops.data';

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

export async function getPlatformDashboard(): Promise<PlatformDashboardStats> {
  await mockDelay();
  return {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === 'active').length,
    trialTenants: tenants.filter((t) => t.status === 'trial').length,
    suspendedTenants: tenants.filter((t) => t.status === 'suspended').length,
    mrrBdt: platformRevenue.mrrBdt,
    arrBdt: platformRevenue.arrBdt,
    growthPercentage: platformRevenue.growthPercentage,
    openTickets: platformSupportTickets.filter((t) => t.status === 'open' || t.status === 'pending').length,
    recentContacts: platformContacts.slice(0, 5),
    topTenants: [...tenants].sort((a, b) => b.customers - a.customers).slice(0, 5),
    chartData: platformRevenue.chartData,
  };
}

export async function listTenants(params?: { q?: string; status?: string }) {
  await mockDelay();
  let list = [...tenants];
  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q),
    );
  }
  if (params?.status) {
    list = list.filter((t) => t.status === params.status);
  }
  return {
    items: list,
    total: list.length,
    stats: {
      total: tenants.length,
      active: tenants.filter((t) => t.status === 'active').length,
      suspended: tenants.filter((t) => t.status === 'suspended').length,
      trial: tenants.filter((t) => t.status === 'trial').length,
    },
  };
}

export async function getTenant(id: string) {
  await mockDelay();
  const tenant = getTenantById(id);
  if (!tenant) throw new Error('Tenant not found');
  const tickets = platformSupportTickets.filter((t) => t.tenantId === tenant.id || t.tenantSlug === tenant.slug);
  return { tenant, tickets };
}

export async function saveTenant(data: Omit<TenantPortal, 'id' | 'createdAt' | 'updatedAt'>) {
  await mockDelay();
  const created = createTenant(data);
  return created;
}

export async function editTenant(id: string, updates: Partial<TenantPortal>) {
  await mockDelay();
  const updated = updateTenant(id, updates);
  return updated;
}

export async function removeTenant(id: string) {
  await mockDelay();
  const ok = deleteTenant(id);
  if (!ok) throw new Error('Failed to delete tenant');
  return { success: true };
}

export async function listAdmins() {
  await mockDelay();
  return {
    items: platformAdmins,
    packages: adminPackages,
    total: platformAdmins.length,
  };
}

export async function listAdminPackages() {
  await mockDelay();
  return {
    items: adminPackages,
    total: adminPackages.length,
    yearlyDiscountMonths: platformSettings.yearlyDiscountMonths,
    yearlyDiscountPercent: platformSettings.yearlyDiscountPercent,
  };
}

export async function getRevenueData() {
  await mockDelay();
  return platformRevenue;
}

export async function listContacts() {
  await mockDelay();
  return {
    items: platformContacts,
    total: platformContacts.length,
  };
}

export async function updateContactStatus(id: string, status: PlatformContact['status']) {
  await mockDelay();
  const contact = platformContacts.find((c) => c.id === id);
  if (!contact) throw new Error('Contact not found');
  contact.status = status;
  return contact;
}

export async function listPlugins() {
  await mockDelay();
  return {
    items: pluginsMarketplaceFull,
    total: pluginsMarketplaceFull.length,
  };
}

export async function listFileManager(path = '') {
  await mockDelay();
  let items = platformFileManager;
  if (path) {
    items = items.filter((f) => f.path.startsWith(path));
  }
  return {
    root: 'public/uploads',
    currentPath: path,
    items,
    total: items.length,
  };
}

export async function listSupportTickets() {
  await mockDelay();
  return {
    items: platformSupportTickets,
    total: platformSupportTickets.length,
  };
}

export async function getSupportTicketDetails(id: string) {
  await mockDelay();
  const ticket = platformSupportTickets.find((t) => t.id === id);
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
}

export async function replySupportTicket(id: string, body: string) {
  await mockDelay();
  const ticket = platformSupportTickets.find((t) => t.id === id);
  if (!ticket) throw new Error('Ticket not found');
  const newMsg = {
    id: `pmsg_${Date.now()}`,
    sender: 'platform_support' as const,
    senderName: 'Super Admin',
    body,
    sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  ticket.messages.push(newMsg);
  ticket.updatedAt = newMsg.sentAt;
  ticket.status = 'resolved';
  return ticket;
}

export async function listShowcase() {
  await mockDelay();
  return {
    items: productShowcase,
    total: productShowcase.length,
  };
}

export async function getSettings() {
  await mockDelay();
  return platformSettings;
}

export async function updateSettings(updates: Partial<PlatformSoftwareSettings>) {
  await mockDelay();
  Object.assign(platformSettings, updates);
  return platformSettings;
}

export async function getRedisLogs(level?: string) {
  await mockDelay();
  let logs = [...systemLogs];
  if (level && level !== 'all') {
    logs = logs.filter((l) => l.level === level);
  }
  return {
    logs,
    stats: {
      redisMemoryMb: 82.4,
      redisKeysTotal: 1420,
      uptimeDays: 48,
      activeSessions: 64,
    },
  };
}

export async function toggleMaintenance(enabled: boolean) {
  await mockDelay();
  platformSettings.maintenanceMode = enabled;
  return { maintenanceMode: enabled };
}

export async function listUserAccess() {
  await mockDelay();
  return {
    roles: userAccessRoles,
    admins: platformAdmins,
  };
}
