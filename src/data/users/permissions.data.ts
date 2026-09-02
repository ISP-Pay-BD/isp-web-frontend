import type { PermissionMap } from '@/types/auth';

export const fullAdminPermissions: PermissionMap = {
  area: ['read', 'create', 'update', 'delete'],
  packages: ['read', 'create', 'update', 'delete'],
  customer: ['read', 'create', 'update', 'delete', 'update_subscription', 'update_conn'],
  employee: ['read', 'create', 'update', 'delete'],
  employee_attendance: ['read', 'create', 'update', 'delete'],
  advance_salary: ['read', 'create', 'update', 'delete'],
  Resellers: ['read', 'create', 'update', 'delete'],
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
  reports: ['read'],
  software_settings: ['read', 'update'],
  routers: ['read', 'create', 'update', 'delete', 'sync'],
  profile_update: ['read', 'update'],
  password_change: ['update'],
  payment: ['read', 'invoice', 'payment'],
  subscription: ['read', 'renew'],
  whatsapp_business: ['read', 'update', 'marketing'],
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
