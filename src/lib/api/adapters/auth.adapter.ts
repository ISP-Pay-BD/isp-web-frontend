import type { PermissionMap, User, UserRole, UserStatus } from '@/types/auth';

// Inverted map from PHP PermissionIdMap
const PERMISSION_ID_TO_KEY: Record<number, string> = {
  1: 'area.read',
  2: 'area.create',
  3: 'area.update',
  4: 'area.delete',

  5: 'packages.read',
  6: 'packages.create',
  7: 'packages.update',
  8: 'packages.delete',

  9: 'customer.read',
  10: 'customer.create',
  11: 'customer.update',
  12: 'customer.delete',
  13: 'customer.update_subscription',
  14: 'customer.update_conn',
  15: 'customer.free_customer_create',

  16: 'employee.read',
  17: 'employee.create',
  18: 'employee.update',
  19: 'employee.delete',

  20: 'employee_attendance.read',
  21: 'employee_attendance.create',
  22: 'employee_attendance.update',
  23: 'employee_attendance.delete',

  24: 'advance_salary.read',
  25: 'advance_salary.create',
  26: 'advance_salary.update',
  27: 'advance_salary.delete',

  28: 'resellers.read',
  29: 'resellers.create',
  30: 'resellers.update',
  31: 'resellers.delete',
  32: 'resellers.update_subscription',
  33: 'resellers.update_conn',
  34: 'resellers.self_recharge',
  35: 'resellers.daily_payment_generate',

  36: 'customer_payment.read',
  37: 'customer_payment.create',
  38: 'customer_payment.update',
  39: 'customer_payment.delete',
  40: 'customer_payment.invoice',

  41: 'employee_payment.read',
  42: 'employee_payment.create',
  43: 'employee_payment.update',
  44: 'employee_payment.delete',

  45: 'inventory_purchess.read',
  46: 'inventory_purchess.create',
  47: 'inventory_purchess.update',
  48: 'inventory_purchess.delete',

  49: 'network.read',
  50: 'network.create',
  51: 'network.update',
  52: 'network.delete',

  53: 'hotspot.read',
  54: 'hotspot.create',
  55: 'hotspot.update',
  56: 'hotspot.delete',

  57: 'olt.read',
  58: 'olt.create',
  59: 'olt.update',
  60: 'olt.delete',

  61: 'accounting.read',
  62: 'accounting.create',
  63: 'accounting.update',
  64: 'accounting.delete',

  65: 'support_ticket.read',
  66: 'support_ticket.create',
  67: 'support_ticket.send_msg',
  68: 'support_ticket.update',
  69: 'support_ticket.delete',

  70: 'referral.read',
  71: 'referral.update',

  72: 'recycle_bin.read',
  73: 'recycle_bin.restore',
  74: 'recycle_bin.delete_forever',
  75: 'recycle_bin.empty',

  76: 'sms_message.read',
  77: 'sms_message.create',
  78: 'sms_message.delete',

  79: 'reports.read',
  80: 'reports.create',
  81: 'reports.update',
  82: 'reports.delete',

  83: 'software_settings.read',
  84: 'software_settings.update',

  85: 'routers.read',
  86: 'routers.create',
  87: 'routers.update',
  88: 'routers.delete',
  89: 'routers.sync',

  90: 'profile_update.read',
  91: 'profile_update.update',

  92: 'password_change.update',

  93: 'ai_chat.chat',

  94: 'whatsapp_business.read',
  95: 'whatsapp_business.update',
  96: 'whatsapp_business.ai',
  97: 'whatsapp_business.utility',
  98: 'whatsapp_business.authentication',
  99: 'whatsapp_business.marketing',

  100: 'whatsapp_waha.read',
  101: 'whatsapp_waha.update',

  102: 'payment.read',
  103: 'payment.invoice',
  104: 'payment.payment',

  105: 'subscription.read',
  106: 'subscription.renew',

  107: 'payment_records.read',
  108: 'payment_records.invoice',
  109: 'payment_records.payment',
};

export function transformPermissionIdsToMap(permissionIds?: number[]): PermissionMap {
  const map: PermissionMap = {};
  if (!permissionIds || !Array.isArray(permissionIds)) {
    return map;
  }

  for (const id of permissionIds) {
    const key = PERMISSION_ID_TO_KEY[id];
    if (key) {
      const [module, action] = key.split('.');
      if (!map[module]) {
        map[module] = [];
      }
      if (action && !map[module].includes(action)) {
        map[module].push(action);
      }
    }
  }

  return map;
}

export interface BackendAuthData {
  user_id: number | string;
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  role: string;
  status?: string;
  tenant_id?: number | string;
  permissions?: number[] | PermissionMap;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export function transformBackendAuthUser(data: BackendAuthData): User {
  let permissions: PermissionMap = {};

  if (Array.isArray(data.permissions)) {
    permissions = transformPermissionIdsToMap(data.permissions);
  } else if (data.permissions && typeof data.permissions === 'object') {
    permissions = data.permissions as PermissionMap;
  }

  const roleNormalized: UserRole = (
    ['super_admin', 'admin', 'resellerAdmin', 'employee', 'user'].includes(data.role)
      ? data.role
      : data.role === 'customer'
        ? 'user'
        : 'admin'
  ) as UserRole;

  return {
    id: String(data.user_id),
    name: data.name || (roleNormalized === 'super_admin' ? 'Super Admin' : 'User'),
    email: data.email || '',
    phone: data.mobile || data.phone || '',
    role: roleNormalized,
    status: (data.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active') as UserStatus,
    tenantId: String(data.tenant_id ?? '1'),
    permissions,
  };
}
