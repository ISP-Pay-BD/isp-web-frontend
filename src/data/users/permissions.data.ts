import type { PermissionMap } from '@/types/auth';

export const fullAdminPermissions: PermissionMap = {
  area: ['read', 'create', 'update', 'delete'],
  packages: ['read', 'create', 'update', 'delete'],
  customer: ['read', 'create', 'update', 'delete', 'update_subscription', 'update_conn', 'free_customer_create'],
  employee: ['read', 'create', 'update', 'delete'],
  employee_attendance: ['read', 'create', 'update', 'delete'],
  advance_salary: ['read', 'create', 'update', 'delete'],
  Resellers: ['read', 'create', 'update', 'delete', 'update_subscription', 'update_conn', 'self_recharge', 'daily_payment_generate'],
  customer_payment: ['read', 'create', 'update', 'delete', 'invoice'],
  employee_payment: ['read', 'create', 'update', 'delete'],
  inventory_purchess: ['read', 'create', 'update', 'delete'],
  network: ['read', 'create', 'update', 'delete'],
  hotspot: ['read', 'create', 'update', 'delete'],
  olt: ['read', 'create', 'update', 'delete'],
  accounting: ['read', 'create', 'update', 'delete'],
  support_ticket: ['read', 'create', 'update', 'delete', 'send_msg'],
  referral: ['read', 'update'],
  recycle_bin: ['read', 'restore', 'delete_forever', 'empty'],
  sms_message: ['read', 'create', 'delete'],
  reports: ['read', 'create', 'update', 'delete'],
  software_settings: ['read', 'update'],
  user_access: ['read', 'update'],
  routers: ['read', 'create', 'update', 'delete', 'sync'],
  profile_update: ['read', 'update'],
  password_change: ['update'],
  payment: ['read', 'invoice', 'payment'],
  subscription: ['read', 'renew'],
  ai_chat: ['chat'],
  whatsapp_business: ['read', 'update', 'ai', 'utility', 'authentication', 'marketing'],
  whatsapp_waha: ['read', 'update'],
};

export const resellerPermissions: PermissionMap = {
  area: ['read', 'create', 'update'],
  packages: ['read'],
  customer: ['read', 'create', 'update', 'update_subscription'],
  customer_payment: ['read', 'create', 'invoice'],
  support_ticket: ['read', 'create', 'send_msg'],
  referral: ['read', 'update'],
  sms_message: ['read', 'create'],
  profile_update: ['read', 'update'],
  password_change: ['update'],
  payment: ['read', 'payment'],
  subscription: ['read', 'renew'],
};

export const customerPermissions: PermissionMap = {
  subscription: ['read', 'renew'],
  payment: ['read', 'invoice', 'payment'],
  support_ticket: ['read', 'create', 'send_msg'],
  profile_update: ['read', 'update'],
  password_change: ['update'],
};

export const employeePermissions: PermissionMap = {
  profile_update: ['read', 'update'],
  password_change: ['update'],
};

export const superAdminPermissions: PermissionMap = fullAdminPermissions;

export interface PermissionSectionDef {
  key: string;
  label: string;
  actions: Record<string, string>;
}

export const PERMISSION_SECTIONS: PermissionSectionDef[] = [
  {
    key: 'area',
    label: 'Service Areas',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'packages',
    label: 'Packages',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'customer',
    label: 'Customers',
    actions: {
      read: 'View',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      update_subscription: 'Update Subscription',
      update_conn: 'Update Connection',
      free_customer_create: 'Free User Create',
    },
  },
  {
    key: 'employee',
    label: 'Employees',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'employee_attendance',
    label: 'Employee Attendance',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'advance_salary',
    label: 'Advance Salary',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'Resellers',
    label: 'Resellers (POP)',
    actions: {
      read: 'View',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      update_subscription: 'Update Subscription',
      update_conn: 'Update Connection',
      self_recharge: 'Self Recharge',
      daily_payment_generate: 'Daily Bill Generate',
    },
  },
  {
    key: 'customer_payment',
    label: 'Customers Payment',
    actions: {
      read: 'View',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      invoice: 'Invoice Download',
    },
  },
  {
    key: 'employee_payment',
    label: 'Employees Payment',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'inventory_purchess',
    label: 'Inventory & Purchase',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'network',
    label: 'Network',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'hotspot',
    label: 'Hotspot',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'olt',
    label: 'OLT',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'accounting',
    label: 'Accounting',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'support_ticket',
    label: 'Support Tickets',
    actions: {
      read: 'View',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      send_msg: 'Send Message',
    },
  },
  {
    key: 'referral',
    label: 'Referral & Reward',
    actions: { read: 'View', update: 'Update' },
  },
  {
    key: 'recycle_bin',
    label: 'Recycle Bin',
    actions: {
      read: 'View',
      restore: 'Restore',
      delete_forever: 'Delete Forever',
      empty: 'Empty Trash',
    },
  },
  {
    key: 'sms_message',
    label: 'SMS Messages',
    actions: { read: 'View', create: 'Create', delete: 'Delete' },
  },
  {
    key: 'reports',
    label: 'Reports',
    actions: { read: 'View', create: 'Create', update: 'Update', delete: 'Delete' },
  },
  {
    key: 'software_settings',
    label: 'Software Settings',
    actions: { read: 'View', update: 'Update' },
  },
  {
    key: 'user_access',
    label: 'User Access Management',
    actions: { read: 'View', update: 'Update' },
  },
  {
    key: 'routers',
    label: 'MikroTik Routers',
    actions: {
      read: 'View',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      sync: 'Sync Users',
    },
  },
  {
    key: 'payment',
    label: 'Payment Records',
    actions: { read: 'View', invoice: 'Invoice Download', payment: 'Online Payment' },
  },
  {
    key: 'subscription',
    label: 'Subscription',
    actions: { read: 'View', renew: 'Renew' },
  },
  {
    key: 'profile_update',
    label: 'Profile Update',
    actions: { read: 'View', update: 'Update' },
  },
  {
    key: 'password_change',
    label: 'Change Password',
    actions: { update: 'Update' },
  },
  {
    key: 'ai_chat',
    label: 'AI Chat Assistant',
    actions: { chat: 'Access Chat' },
  },
  {
    key: 'whatsapp_business',
    label: 'WhatsApp Business',
    actions: {
      read: 'View settings and inbox',
      update: 'Configure credentials',
      ai: 'Service AI auto-reply',
      utility: 'Send Utility templates',
      authentication: 'Send Authentication OTP',
      marketing: 'Send Marketing templates',
    },
  },
  {
    key: 'whatsapp_waha',
    label: 'WhatsApp (WAHA)',
    actions: {
      read: 'View WAHA status',
      update: 'Configure WAHA and pair',
    },
  },
];

export interface CustomUserAccessRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  customRulesCount: number;
  permissions: PermissionMap;
  updatedAt: string;
}

export const customUserAccessList: CustomUserAccessRecord[] = [
  {
    id: 'cua_001',
    userId: 'user_003',
    name: 'POP Manager (Uttara)',
    email: 'reseller@demo.isppaybd.com',
    role: 'resellerAdmin',
    status: 'active',
    customRulesCount: 11,
    permissions: resellerPermissions,
    updatedAt: '2026-08-30 14:20',
  },
  {
    id: 'cua_002',
    userId: 'user_005',
    name: 'Staff Member (Billing)',
    email: 'employee@demo.isppaybd.com',
    role: 'employee',
    status: 'active',
    customRulesCount: 4,
    permissions: {
      ...employeePermissions,
      customer: ['read'],
      customer_payment: ['read', 'create'],
    },
    updatedAt: '2026-09-01 11:05',
  },
  {
    id: 'cua_003',
    userId: 'user_007',
    name: 'Field Tech Kabir',
    email: 'kabir.tech@demo.isppaybd.com',
    role: 'employee',
    status: 'active',
    customRulesCount: 3,
    permissions: {
      ...employeePermissions,
      support_ticket: ['read', 'update', 'send_msg'],
      olt: ['read'],
    },
    updatedAt: '2026-08-15 09:40',
  },
];
